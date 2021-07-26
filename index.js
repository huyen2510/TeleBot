const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const { Telegraf } = require("telegraf");
const bot = new Telegraf("1935525417:AAFmlfhRRiK_vcBHk0AGbs3Nuu84jyPD6-c");

const GetCookie = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });
  await page.goto("https://smcc.vn/Administrator/Login.aspx", {
    waitUntil: "networkidle0",
  }); // wait until page load
  await page.type("#login", "buikhanhhuyena4@gmail.com");
  await page.type("#password", "123456");

  // click and wait for navigation
  await Promise.all([
    page.click("#Button1"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  var data = await page._client.send("Network.getAllCookies");
  return data.cookies.map((x) => `${x.name}=${x.value}`).join("; ");
};

const GetData = async (cookiestring, Startdate, EndDate) => {
  const myHeaders = new fetch.Headers();
  myHeaders.append("cookie", cookiestring);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const d1 = Startdate.toISOString().slice(0, 10);
  const d2 = EndDate.toISOString().slice(0, 10);
  const timed1 = Startdate.toISOString().slice(0, 19);
  const timed2 = EndDate.toISOString().slice(0, 19);
  console.log(d1, d2, timed1, timed2);
  let response = null;
  const url = `https://smcc.vn/API.FREEMIUM/v2/countnewsapi.aspx?rt=1&d1=${d1}&d2=${d2}&timezd1=${timed1}&timezd2=${timed2}`;
  response = await fetch(url, requestOptions);
  const test = await response.json();
  console.log(test);
  return test;
};

const CreateMessage = (data) => {
  const keys = Object.keys(data);
  const temps = keys.map((x) => [x, data[x]]);
  return temps.map((x) => x.join(" : ")).join("\n");
};

async function main() {
  const cookie = await GetCookie();
  const date = new Date();
  const dataJson = await GetData(
    cookie,
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1 + 7, 0, 0),
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23 + 7, 0, 0)
  );
  const message = CreateMessage(dataJson) || "none";
  
  setInterval(function(){  
    bot.telegram.sendMessage("-523985618", message)
  }, 18000000);
  // bot.command('newscount', (ctx) => {
  //   ctx.telegram.sendMessage("-523985618", message)
  // })
  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main();
