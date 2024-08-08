import * as cheerio from "cheerio";
import * as url from "url";

import fs from "fs";

const ROOT = url.fileURLToPath(new URL("../..", import.meta.url));

function info() {
  return {
    IURL: "https://www.oliveyoung.co.kr/store/store/getStoreMain.do?trackingCd=Store_Recommend_Best",
    INTRO: "올리브영 매장 정보를 수집합니다.",
    ACTION:
      "잠시 대기 후 좌측 검색 영역에서 아래로 스크롤, 더 이상 추가되는 매장 정보가 없을 때까지 반복 후 파일 저장.",
    SAMPLE: "data/oy-shoplist.html.sample",
    DATA: "data/oy-shoplist.html",
    OUTPUT: "output/oy-shoplist.csv",
    OUTTRO:
      "==> 매장 정보가 변경된 경우 STEP1 ~ STEP3 를 확인 후, 관련 데이터를 새로 수집해야 합니다.",
  };
}

async function init() {
  const { DATA, IURL, OUTPUT, INTRO, ACTION, OUTTRO } = info();

  console.log(`\n${INTRO}\n`);
  console.log(`STEP 1. ${IURL} 에 접속합니다.`);
  console.log(`STEP 2. ${ACTION}`);
  console.log(
    `STEP 3. 개발자 모드에서 "wordStoreList" 검색 후 해당 하위 노드를 ${DATA} 파일로 저장합니다.`
  );
  console.log(`\n${OUTTRO}\n`);

  if (!fs.existsSync(`${ROOT}${DATA}`)) {
    console.log(`FILE NOT FOUND : ${ROOT}${DATA}\n`);
    console.log(`아래 샘플 파일을 참조 하여 파일을 생성해 주세요.`);
    console.log(`SAMPLE : ${ROOT}${DATA}.sample`);
    return;
  }

  let html = fs.readFileSync(`${ROOT}${DATA}`, "utf8");
  const $ = cheerio.load(html);
  const items = $("#wordStoreList").find("li");

  let result = [
    {
      addr: "주소",
      addr1: "지역",
      addr2: "시군구",
      call: "연락처",
      strNo: "매장번호",
      strNm: "매장명",
      lat: "위도",
      lng: "경도",
      openYn: "매장오픈",
    },
  ];
  for (let item of items) {
    let addr = $(item).find(".addr").text();
    let addr1 = addr.split(" ")[0];
    let addr2 = addr.split(" ")[1];
    let call = $(item).find(".call").text();
    let strNo = $(item).find(".strNo").val();
    let strNm = $(item).find(".strNm").val();
    let lat = $(item).find(".lat").val();
    let lng = $(item).find(".lng").val();
    let openYn = $(item).find(".openYn").val();

    // let title = $(item).find("a").text();
    // let summery = $(item).find(".txt").text();
    result.push({ addr, addr1, addr2, call, strNo, strNm, lat, lng, openYn });
  }

  let output = result.map((r) => {
    return Object.values(r).join("|");
  });
  fs.writeFileSync(`${ROOT}${OUTPUT}`, output.join("\n"));
  console.log(`Saved File : ${ROOT}${OUTPUT}`);
}
init();
