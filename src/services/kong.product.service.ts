import { Inject, Service } from "typedi";
import { BrowserContext, Page } from "playwright";
import { Book, Product, ProductCategoryModel, ProductModel } from "../models";
import { BookAuthorModel } from "../models/book.author.model";

import { AvatarGenerator } from "random-avatar-generator";
import { BookPublisherModel } from "../models/book.publisher.model";
import moment from "moment";
import { ProductCategoryService } from "./product.category.service";
import axios from "axios";
import { UploadService } from "./upload.service";
import { BookSeriesModel } from "../models/book.series.model";
import { Document, Types } from "mongoose";
import {
  BeAnObject,
  IObjectWithTypegooseFunction,
} from "@typegoose/typegoose/lib/types";
import trimAll from "../utils/trimAll";
import { BrowserContextService } from "./browser.context.service";

const generator = new AvatarGenerator();

let beginTime = new Date();
let endTime = new Date();

@Service()
export class KongProductService {
  context: BrowserContext = null;
  isLogin: boolean = false;

  @Inject(() => ProductCategoryService)
  productCategoryService: ProductCategoryService;

  @Inject(() => UploadService)
  uploadService: UploadService;

  @Inject(() => BrowserContextService)
  browserContextService: BrowserContextService;

  checkToLogin = async () => {
    let context = await this.browserContextService.getBrowser();
    const [homePage] = context.pages();
    try {
      await homePage.goto("https://shop.kongfz.com/", {
        timeout: 0,
      });
      await homePage.waitForLoadState("networkidle", {
        timeout: 0,
      });
    } catch (error) {
      await homePage?.close();
      await context?.close();
      this.context = null;
      await this.browserContextService.getBrowser();
      return;
    }

    const nicknameEle = await homePage.waitForSelector("#nickName .info-text");
    const bookFriend = await nicknameEle.innerHTML();
    if (!bookFriend.includes("登录")) {
      this.isLogin = true;
      await homePage.close();
      return;
    }
    context = await this.browserContextService.getBrowser();
    let page = await context.newPage();
    try {
      await page.goto(
        "https://login.kongfz.com/Pc/Login/iframe?returnUrl=https://www.kongfz.com/"
      );
    } catch (error) {
      console.error(error);
      await page.close();
      return;
    }

    try {
      const usernameInput = await page.waitForSelector("#username");
      await usernameInput.focus();
      await usernameInput.type("18026938187");

      const passwordInput = await page.waitForSelector("#password");
      await passwordInput.focus();
      await passwordInput.type("lyp82ndlf");

      const checkBoxInput = await page.waitForSelector(".autoLogin input");
      await checkBoxInput.click();

      const loginBtn = await page.waitForSelector(".login_submit");
      await loginBtn.click();
      await page.waitForLoadState("networkidle", {
        timeout: 0,
      });
      await page.close();
      await homePage.close();
    } catch (error) {
      console.error(error);
      await page.close();
      await homePage.close();
      await this.browserContextService.getBrowser();
    }
  };

  async toCategoryPage(url: string) {
    try {
      await this.checkToLogin();
      const context = await this.browserContextService.getBrowser();
      let page = await context?.newPage();
      try {
        console.log("正在跳转分类页面.....", url);
        await page?.goto(url, {
          timeout: 0,
        });
        await page?.waitForLoadState("networkidle", {
          timeout: 0,
        });
        console.log("跳转到了分类页面");
      } catch (error) {
        console.error("去分类页面出错", error);
        await page.close();
        page = await context.newPage();
        return;
      }

      const listEle = page.getByText("图书条目");
      await listEle.click();
      const sellEle = page.getByText("销量");
      await sellEle.click();
      console.log("按照销量排序完成...........");

      for (let pageIndex = 2; pageIndex <= 100; pageIndex++) {
        const listItems = await page.$$("#listBox .item");
        for (let index = 0; index < listItems.length; index++) {
          beginTime = new Date();
          const item = listItems[index];
          const itemHtml = await item.waitForSelector(".title a", {
            timeout: 0,
          });
          const detailUrl = await itemHtml.getAttribute("href");
          try {
            await this.getProductFromDetail(detailUrl, context);
          } catch (error) {
            console.error("获取书目页面出错", error);
            this.context = null;
            await this.browserContextService.getBrowser();
            continue;
          }
        }
        try {
          await page.goto(`${url}/v1w${pageIndex}`);
        } catch (error) {
          console.error("获取下一页出错", error);
          await page.close();
          continue;
        }
      }
      await page.close();
    } catch (error) {
      console.error("获取分类页面出错", error);
      await this.context?.close();
      this.context = null;
      this.browserContextService.getBrowser();
    }
  }

  async getProductFromDetail(url: string, context?: BrowserContext) {
    console.log("开始在", url, "获取数据");
    beginTime = new Date();
    this.context = context;
    context = context || (await this.browserContextService.getBrowser());
    const page = await context?.newPage();
    try {
      await page.goto(url, {
        timeout: 0,
      });
    } catch (error) {
      console.error("获取书籍目录数据出错", error);
      await page?.close();
      return;
    }
    try {
      const priceArea = await page.waitForSelector("#priceOrder");
      await priceArea.click();
      const sortArea = await page.waitForSelector(
        "#priceOrder .price-select-box a:first-child"
      );
      await sortArea.click();
      await page.waitForLoadState("networkidle", {
        timeout: 0,
      });
    } catch (error) {
      console.error("价格排序出错", error);
      await page.close();
      return;
    }
    try {
      const product = new ProductModel();
      const images: string[] = [];
      const insideImages: string[] = [];

      let bookData: Book = {
        title: "",
        cover: "",
        isbn: "",
        bookPrice: 0,
        price: 0,
        sellPrice: 0,
        sellShipPrice: 0,
        newPrice: 0,
        newSellPrice: 0,
        newShipPrice: 0,
        authors: [],
        publisher: "",
        binding: "",
        format: "",
        paper: "",
        category: "",
        categoryId: "",
      };
      //开始获取出版社等其他信息
      try {
        const bookInfoItems = await page.$$(".detail-con-right-top .item");
        for (let index = 0; index < bookInfoItems.length; index++) {
          const bookInfoItem = bookInfoItems[index];
          const bookInfoText = await bookInfoItem?.innerText();
          if (bookInfoText.includes("ISBN")) {
            const isbn = bookInfoText.replace("ISBN:", "").replace(" ", "");
            bookData.isbn = isbn;
          }
          if (bookInfoText.includes("插图图片")) {
            //插图方式
            const imagesEle = await bookInfoItem.$("a");
            const context = await this.browserContextService.getBrowser();
            const insideImagesPage = await context.newPage();
            try {
              const href =
                "https://item.kongfz.com" +
                (await imagesEle.getAttribute("href"));
              // console.log("开始获取图片", href);
              try {
                await insideImagesPage.goto(href);
              } catch (error) {
                console.error(error);
                await insideImagesPage.close();
                return;
              }

              await insideImagesPage.waitForLoadState();
              for (let index = 0; index < 20; index++) {
                await insideImagesPage.waitForTimeout(500);
                await insideImagesPage.mouse.wheel(0, 500);
              }
              const imageEles = await insideImagesPage.$$("a img");
              for (let index = 0; index < imageEles.length; index++) {
                const element = imageEles[index];
                let src = await element.getAttribute("src");
                if (src.includes("_water")) {
                  src = src.replace("_water", "");
                  insideImages.push(src);
                }
              }
              await insideImagesPage.close();
            } catch (error) {
              console.error(error);
              await this.browserContextService.getBrowser();
              await insideImagesPage.close();
            }
          }
          if (bookInfoText.includes("出版社")) {
            const publisher = bookInfoText
              .replace("出版社:", "")
              .replace(" ", "");
            const bookPublish = await BookPublisherModel.findOne({
              name: publisher,
            });
            bookData.publisher = publisher;
            bookData.publisherId = bookPublish?.id;
            if (!bookPublish) {
              const newPublish = new BookPublisherModel();
              newPublish.name = publisher;
              newPublish.cover = generator.generateRandomAvatar();
              newPublish.description = publisher;
              await newPublish.save();
              bookData.publisherId = newPublish.id;
            }
          }
          if (bookInfoText.includes("出版时间")) {
            const publishTime = bookInfoText.replace("出版时间:", "");
            try {
              bookData.publishTime = moment(
                publishTime.length > 4
                  ? publishTime + "-10 00:00:00"
                  : publishTime + "01-10 00:00:00"
              ).toDate();
            } catch (error) {
              console.error(error);
              await this.browserContextService.getBrowser();
              bookData.publishTime = new Date();
            }
          }
          if (bookInfoText.includes("版次")) {
            const publishVersion = bookInfoText.replace("版次:", "");
            bookData.publishVersion = +publishVersion;
          }

          if (bookInfoText.includes("页数")) {
            const pages = bookInfoText.replace("页数:", "").replace("页", "");
            bookData.pageAmount = +pages;
          }
          if (bookInfoText.includes("分类")) {
            const category = bookInfoText.replace("分类:", "").replace(" ", "");
            const categories = category.split(">");
            const bookCate =
              await this.productCategoryService.getOrCreateBookCategory();
            let lastCate = bookCate;
            for (let index = 0; index < categories.length; index++) {
              const cate = categories[index];
              const cateRecord = await ProductCategoryModel.findOne({
                name: cate,
                superCategoryName: bookCate.name,
                superCategoryId: bookCate.id,
              });
              if (!cateRecord) {
                const newCate = new ProductCategoryModel();
                newCate.name = cate;
                newCate.superCategoryName = lastCate.name;
                newCate.superCategoryId = lastCate.id;
                await newCate.save();
                if (index === categories.length - 1) {
                  bookData.categoryId = newCate.id;
                  product.categoryId = newCate.id;
                }
                lastCate = newCate;
              } else {
                lastCate = cateRecord;
              }
              if (cateRecord && index === categories.length - 1) {
                bookData.categoryId = cateRecord.id;
                product.categoryId = cateRecord.id;
              }
            }
            bookData.category = categories[categories.length - 1];
            product.category = categories[categories.length - 1];
          }
          if (bookInfoText.includes("装帧")) {
            const binding = bookInfoText.replace("装帧:", "").replace(" ", "");
            bookData.binding = binding;
          }
          if (bookInfoText.includes("开本")) {
            const format = bookInfoText.replace("开本:", "").replace(" ", "");
            bookData.format = format;
          }
          if (bookInfoText.includes("纸张")) {
            const paper = bookInfoText.replace("纸张:", "").replace(" ", "");
            bookData.paper = paper;
          }
          if (bookInfoText.includes("人买过")) {
            const buyAmount = bookInfoText
              .replace("人买过", "")
              .replace(" ", "");
            bookData.buyAmount = +buyAmount;
          }
          if (bookInfoText.includes("定价")) {
            const bookPrice = bookInfoText
              .replace("定价:", "")
              .replace(" ", "");
            bookData.bookPrice = Number(bookPrice) * 100;
          }
          if (bookInfoText.includes("丛书")) {
            const series = bookInfoText.replace("丛书:", "").replace(" ", "");
            const seriesRecord = await BookSeriesModel.findOne({
              name: series,
            });

            bookData.series = series;
            bookData.seriesId = seriesRecord?.id;
            if (!seriesRecord) {
              const newSeries = new BookSeriesModel();
              newSeries.name = series;
              newSeries.cover = generator.generateRandomAvatar();
              newSeries.description = series;
              await newSeries.save();
              bookData.seriesId = newSeries.id;
            }
          }
          if (bookInfoText.includes("原版书名")) {
            const originalName = bookInfoText
              .replace("原版书名:", "")
              .replace(" ", "");
            bookData.originalName = originalName;
          }
          if (bookInfoText.includes("正文语种")) {
            const printVersion = bookInfoText
              .replace("正文语种:", "")
              .replace(" ", "");
            bookData.contentLang = printVersion;
          }
          if (bookInfoText.includes("字数")) {
            const wordAmount = bookInfoText
              .replace("字数:", "")
              .replace("千字", "")
              .replace(" ", "");
            bookData.wordAmount = +wordAmount;
          }
          // console.log({ bookInfoText });
        }
      } catch (error) {
        console.error(error);
        await this.browserContextService.getBrowser();
        return;
      }

      const titleEle = await page.waitForSelector(".detail-title");
      const title = await titleEle?.innerText();

      product.title = title;
      bookData.title = title;

      const introductionEles = await page.$$(".jianjie");
      let contentIntro = "";
      let authorIntro = "";
      let catalog = "";

      for (let index = 0; index < introductionEles.length; index++) {
        const element = introductionEles[index];
        const text = await element.innerHTML();
        if (text.includes("内容简介:")) {
          contentIntro = text.replace("内容简介:", "");
        }
        if (text.includes("作者简介:")) {
          authorIntro = text.replace("作者简介:", "");
        }
        if (text.includes("目录:")) {
          catalog = text.replace("目录:", "");
        }
      }
      bookData.authorIntro = authorIntro;
      bookData.contentIntro = contentIntro;
      bookData.catalog = catalog;

      // console.log("开始获取作者");
      const authorItems = await page.$$('.zuozhe span a[itemprop="author"]');

      const authors = [];
      for (let index = 0; index < authorItems.length; index++) {
        const authorItem = authorItems[index];
        const author = await authorItem.innerHTML();
        const authorRecord = await BookAuthorModel.findOne({
          name: author,
        });
        if (!authorRecord) {
          const newAuthor = new BookAuthorModel();
          newAuthor.name = author;
          newAuthor.cover = generator.generateRandomAvatar();
          newAuthor.description = authorIntro;
          await newAuthor.save();
        }
        authors.push(author);
      }
      bookData.authors = authors;
      //获取作者完成===================================

      //获取封面
      const coverImage = await page.$(".detail-con-left .detail-img a");
      const coverImageUrl = await coverImage.getAttribute("href");
      const context = await this.browserContextService.getBrowser();
      const coverPage = await context.newPage();
      try {
        try {
          await coverPage.goto(coverImageUrl);
        } catch (error) {
          console.log(error);
          await coverPage.close();
          return;
        }

        const coverElement = await coverPage.waitForSelector("img");
        let coverUrl = await coverElement.getAttribute("src");
        coverUrl = coverUrl.replace("_water", "");
        const response = await axios.get(coverUrl, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "utf-8");
        const uploadRlt = await this.uploadService.uploadTTImage(
          buffer,
          product.id + ".png"
        );
        // console.log(uploadRlt);
        bookData.cover = "https://" + uploadRlt;
        images.push(bookData.cover);
        product.cover = bookData.cover;
        await coverPage.close();
      } catch (error) {
        console.log(error);

        await coverPage.close();
        return await page.close();
      }

      product.originUrl = page.url();
      await this.getPriceByCurrentPage(
        page,
        bookData,
        product,
        images,
        insideImages
      );
    } catch (error) {
      this.context = null;
      await this.browserContextService.getBrowser();
      console.error(error);
      await page.close();
    }
  }

  async getPriceByCurrentPage(
    page: Page,
    bookData: Book,
    product: Document<unknown, BeAnObject, Product> &
      Omit<
        Product & {
          _id: Types.ObjectId;
        },
        "typegooseName"
      > &
      IObjectWithTypegooseFunction,
    images: string[],
    insideImages: string[]
  ) {
    await page.waitForLoadState();
    // console.log("开始获取价格=======");

    const listItems = await page.$$(".list-con-title a");

    let itemDetail: any = {};
    let pricePageHref = null;
    for (let index = 0; index < listItems.length; index++) {
      const item = listItems[index];
      const title = await item?.innerText();
      if (title.includes(trimAll(bookData.title))) {
        pricePageHref = await item.getAttribute("href");
        break;
      }
    }
    if (pricePageHref) {
      try {
        itemDetail = await this.getItemDetailByUrl(
          pricePageHref,
          product.id,
          bookData.isbn
        );
      } catch (error) {
        console.error({ error });
      }
    } else {
      return await page.close();
    }
    if (!itemDetail) {
      return await page.close();
    }
    const { itemImages, nowPrice, shipPrice, quality = "" } = itemDetail;
    product.images = [...images, ...(itemImages || []), ...insideImages];
    console.log({ quality, shipPrice, nowPrice });
    if (!nowPrice) {
      return await page.close();
    }

    product.buyUrlOnKong = page.url();

    let productToPut = await ProductModel.findOne({
      "bookData.isbn": bookData.isbn,
    });

    if (productToPut) {
      console.log("找到了相同的isbn，开始更新===============================");
      bookData = {
        ...bookData,
        ...productToPut.bookData,
      };
      productToPut.images = product.images;
      const newSellPrice = Number(nowPrice) * 100 || 0;
      const newShipPrice = Number(shipPrice) * 100 || 0;
      productToPut.bookData = {
        ...productToPut.bookData,
        sellPrice: newSellPrice + newShipPrice,
        newShipPrice: newShipPrice,
        newSellPrice: newSellPrice,
      };
      if (
        productToPut.bookData?.price.toFixed(2) !==
        (newSellPrice + newShipPrice).toFixed(2)
      ) {
        console.log(
          "价格不一致，需要调整======================",
          productToPut.bookData?.price.toFixed(2),
          (newSellPrice + newShipPrice).toFixed(2)
        );
        productToPut.needToAdjustLatestPrice = true;
        try {
          const profitRate =
            (productToPut.price - newSellPrice - newShipPrice) /
            productToPut.price;
          await page.close();
          await ProductModel.updateOne(
            { id: productToPut.id },
            {
              $set: {
                needToAdjustLatestPrice: true,
                lastCheckTime: new Date(),
                images: product.images,
                bookData: {
                  ...productToPut.bookData,
                  newShipPrice: newShipPrice,
                  newSellPrice: newSellPrice,
                  newPrice: newSellPrice + newShipPrice,
                },
                profitRate: !Number.isNaN(profitRate) ? profitRate : 0,
                updatedAt: new Date(),
              },
            }
          );
        } catch (error) {
          console.error("更新价格失败", error);
          this.context = null;
          await this.browserContextService.getBrowser();
        }
        endTime = new Date();
        console.log(
          "耗时",
          (endTime.getTime() - beginTime.getTime()) / 1000,
          "秒"
        );
        return;
      } else {
        console.log("价格一致，不需要调整======================");
        await page.close();
        productToPut.needToAdjustLatestPrice = false;
        try {
          const profitRate =
            (productToPut.price - newSellPrice - newShipPrice) /
            productToPut.price;
          await ProductModel.updateOne(
            { id: productToPut.id },
            {
              $set: {
                images: product.images,
                lastCheckTime: new Date(),
                bookData: {
                  ...productToPut.bookData,
                  sellPrice: newSellPrice,
                  shipPrice: newShipPrice,
                  newPrice: newSellPrice + newShipPrice,
                  price: newSellPrice + newShipPrice,
                  newShipPrice: newShipPrice,
                  newSellPrice: newSellPrice,
                },
                profitRate:
                  !Number.isNaN(profitRate) && profitRate > 0 ? profitRate : 0,
                needToAdjustLatestPrice: false,
              },
            }
          );
        } catch (error) {
          this.context = null;
          await this.browserContextService.getBrowser();
          console.log(error);
        }
      }
      endTime = new Date();
      console.log(
        "耗时",
        (endTime.getTime() - beginTime.getTime()) / 1000,
        "秒"
      );

      return;
    } else {
      console.log(
        "没有找到相同的isbn，开始创建==============================="
      );
      product.bookData = bookData;
      product.appearance = quality;
      const newSellPrice = Number(nowPrice) * 100 || 0;
      const newShipPrice = Number(shipPrice) * 100 || 0;
      const newPrice = newSellPrice + newShipPrice;
      if (newPrice === 0) {
        return page.close();
      }
      product.bookData.sellPrice = newSellPrice;
      product.bookData.sellShipPrice = newShipPrice;
      product.bookData.newShipPrice = newShipPrice;
      product.bookData.newSellPrice = newSellPrice;
      product.bookData.newPrice = newPrice;
      product.bookData.price = newPrice;
      product.price = newPrice * 1.5;
      product.createdAt = new Date();

      product.type = "book";
      try {
        const profitRate = (product.price - newPrice) / product.price;
        console.log("新产品的利润率", { profitRate });
        product.profitRate = !Number.isNaN(profitRate) ? profitRate : 0;
        await product.save();
      } catch (error) {
        this.context = null;
        await this.browserContextService.getBrowser();
        console.log(error);
      }
      endTime = new Date();
      console.log(
        "耗时",
        (endTime.getTime() - beginTime.getTime()) / 1000,
        "秒"
      );
    }
    await page.close();
    endTime = new Date();
    console.log("耗时", (endTime.getTime() - beginTime.getTime()) / 1000, "秒");
  }

  async getItemDetailByUrl(url: string, productId: string, isbn: string) {
    console.log("开始获取价格详情=======", url);
    let context = await this.browserContextService.getBrowser();
    let page = await context.newPage();
    try {
      await page.goto(url);
    } catch (error) {
      console.error("打开页面失败，重新打开", error);
      await page.close();
      return;
    }

    const priceEle = await page.waitForSelector(".now-price .now-price-text");
    const nowPrice = await priceEle?.innerText();
    const shipPriceEle = await page.waitForSelector(
      ".carry-cont .express-wrapper"
    );
    let shipPriceText = await shipPriceEle?.innerText();
    let shipPrice = shipPriceText
      .replace("￥", "")
      .replace(" ", "")
      .replace("快递", "")
      .replace("快递", "")
      .replace("普通", "")
      .replace("包裹", "")
      .replace("挂号印刷品", "")
      .replace("无需物流", "")
      .replace("挂号信函", "")
      .replace("EMS", "")
      .replace("￥", "")
      .replace("￥", "")
      .replace(" ", "");
    if (shipPrice.includes("卖家")) {
      shipPrice = "0";
    }
    const productExists = await ProductModel.findOne({
      "bookData.isbn": isbn,
    });
    const itemImages = [];
    let quality = "";

    if (!productExists) {
      const qualityEle = await page.$(".quality .quality-desc-common");
      quality = await qualityEle?.innerText();
      for (let index = 0; index < 20; index++) {
        await page.waitForTimeout(500);
        await page.mouse.wheel(0, 500);
      }
      try {
        const imageEles = await page.$$("ul li a img");

        for (let index = 0; index < imageEles.length; index++) {
          const imageEle = imageEles[index];
          const imageUrl = await imageEle.getAttribute("src");
          if (!imageUrl.includes("_b")) {
            continue;
          }
          try {
            const response = await axios.get(imageUrl.replace("_b", ""), {
              responseType: "arraybuffer",
            });
            const buffer = Buffer.from(response.data, "utf-8");
            const uploadRlt = await this.uploadService.uploadTTImage(
              buffer,
              productId + index + ".png"
            );
            itemImages.push("https://" + uploadRlt);
          } catch (error) {
            console.log(error);
            itemImages.push(imageUrl.replace("_b", ""));
            await page.close();
          }
        }
      } catch (error) {
        console.error({ error });
        await page.close();
      }
    }

    await page.close();
    return {
      nowPrice,
      shipPrice: shipPrice.split(" ")[0],
      itemImages,
      quality,
    };
  }
}
