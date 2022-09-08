///////////////////////// select box 설정 (지역, 매매기간) /////////////////////////
let date = new Date();

window.onload = function () {
  let yearEl = document.querySelector("#year");
  let yearOpt = `<option value="">매매년도선택</option>`;
  let year = date.getFullYear();
  for (let i = year; i > year - 20; i--) {
    yearOpt += `<option value="${i}">${i}년</option>`;
  }
  yearEl.innerHTML = yearOpt;

  // 브라우저가 열리면 시도정보 얻기.
  sendRequest("sido", "*00000000");
};

document.querySelector("#year").addEventListener("change", function () {
  let month = date.getMonth() + 1;
  let monthEl = document.querySelector("#month");
  let monthOpt = `<option value="">매매월선택</option>`;
  let yearSel = document.querySelector("#year");
  let m = yearSel[yearSel.selectedIndex].value == date.getFullYear() ? month : 13;
  for (let i = 1; i < m; i++) {
    monthOpt += `<option value="${i < 10 ? "0" + i : i}">${i}월</option>`;
  }
  monthEl.innerHTML = monthOpt;
});

// https://juso.dev/docs/reg-code-api/
// let url = "https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes";
// let regcode = "*00000000";
// 전국 특별/광역시, 도
// https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes?regcode_pattern=*00000000

// 시도가 바뀌면 구군정보 얻기.
document.querySelector("#sido").addEventListener("change", function () {
  if (this[this.selectedIndex].value) {
    let regcode = this[this.selectedIndex].value.substr(0, 2) + "*00000";
    //alert(this[this.selectedIndex].value.substr(0, 2));
    sendRequest("gugun", regcode);
  } else {
    initOption("gugun");
    initOption("dong");
  }
});

// 구군이 바뀌면 동정보 얻기.
document.querySelector("#gugun").addEventListener("change", function () {
  if (this[this.selectedIndex].value) {
    let regcode = this[this.selectedIndex].value.substr(0, 5) + "*";
    sendRequest("dong", regcode);
  } else {
    initOption("dong");
  }
});

function sendRequest(selid, regcode) {
  const url = "https://grpc-proxy-server-mkvo6j4wsq-du.a.run.app/v1/regcodes";
  let params = "regcode_pattern=" + regcode + "&is_ignore_zero=true";
  fetch(`${url}?${params}`)
    .then((response) => response.json())
    .then((data) => addOption(selid, data));
}

function addOption(selid, data) {
  let opt = ``;
  initOption(selid);
  switch (selid) {
    case "sido":
      opt += `<option value="">시도선택</option>`;
      data.regcodes.forEach(function (regcode) {
        opt += `
        <option value="${regcode.code}">${regcode.name}</option>
        `;
      });
      break;
    case "gugun":
      opt += `<option value="">구군선택</option>`;
      for (let i = 0; i < data.regcodes.length; i++) {
        if (i != data.regcodes.length - 1) {
          if (
            data.regcodes[i].name.split(" ")[1] == data.regcodes[i + 1].name.split(" ")[1] &&
            data.regcodes[i].name.split(" ").length != data.regcodes[i + 1].name.split(" ").length
          ) {
            data.regcodes.splice(i, 1);
            i--;
          }
        }
      }
      let name = "";
      data.regcodes.forEach(function (regcode) {
        if (regcode.name.split(" ").length == 2) name = regcode.name.split(" ")[1];
        else name = regcode.name.split(" ")[1] + " " + regcode.name.split(" ")[2];
        opt += `
    <option value="${regcode.code}">${name}</option>
    `;
      });
      break;
    case "dong":
      opt += `<option value="">동선택</option>`;
      let idx = 2;
      data.regcodes.forEach(function (regcode) {
        if (regcode.name.split(" ").length != 3) idx = 3;
        opt += `
    <option value="${regcode.code}">${regcode.name.split(" ")[idx]}</option>
    `;
      });
  }
  document.querySelector(`#${selid}`).innerHTML = opt;
}

function initOption(selid) {
  let options = document.querySelector(`#${selid}`);
  options.length = 0;
  // let len = options.length;
  // for (let i = len - 1; i >= 0; i--) {
  //   options.remove(i);
  // }
}

///////////////////////// 아파트 매매 정보 /////////////////////////
document.querySelector("#list-btn").addEventListener("click", function () {
  // 선택한 위치 (시도 + 구군 + 동)
  let sidoSel = document.querySelector("#sido");
  let gugunSel = document.querySelector("#gugun");
  let dongSel = document.querySelector("#dong");
  let address =
    sidoSel[sidoSel.selectedIndex].textContent +
    " " +
    gugunSel[gugunSel.selectedIndex].textContent +
    " " +
    dongSel[dongSel.selectedIndex].textContent;

  // 아파트 매매 정보 받아오기
  let url =
    "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev";
  let regCode = gugunSel[gugunSel.selectedIndex].value.substr(0, 5);
  let yearSel = document.querySelector("#year");
  let year = yearSel[yearSel.selectedIndex].value;
  let monthSel = document.querySelector("#month");
  let month = monthSel[monthSel.selectedIndex].value;
  let dealYM = year + month;

  // 모두 선택했는지 확인
  if (
    !sidoSel[sidoSel.selectedIndex].value ||
    !gugunSel[gugunSel.selectedIndex].value ||
    !dongSel[dongSel.selectedIndex].value ||
    !yearSel[yearSel.selectedIndex].value ||
    !monthSel[monthSel.selectedIndex].value
  ) {
    alert("모두 선택해주세요!");
    return;
  }

  // 데이터 받아오기
  let queryParams = encodeURIComponent("serviceKey") + "=" + "zkey"; /*Service Key*/
  queryParams +=
    "&" + encodeURIComponent("LAWD_CD") + "=" + encodeURIComponent(regCode); /*아파트소재 구군*/
  queryParams +=
    "&" + encodeURIComponent("DEAL_YMD") + "=" + encodeURIComponent(dealYM); /*조회년월*/
  queryParams += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /*페이지번호*/
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("30"); /*페이지당건수*/
  console.log(`${url}?${queryParams}`);
  fetch(`${url}?${queryParams}`)
    .then((response) => response.text())
    .then((data) => {
      mapMarker(address, data), makeList(data);
    });
});

function makeList(data) {
  document.querySelector("#aptlist").setAttribute("style", "display: ;");
  let tbody = document.querySelector("#aptlist");
  let parser = new DOMParser();
  const xml = parser.parseFromString(data, "application/xml");
  //   initTable();
  tbody.innerHTML = `
    <h3>거래 정보</h3>
    <ul class="list-group list-group-flush">
  `;

  let apts = xml.querySelectorAll("item");
  apts.forEach((apt) => {
    let date =
      apt.querySelector("년").textContent +
      "." +
      apt.querySelector("월").textContent +
      "." +
      apt.querySelector("일").textContent;
    tbody.innerHTML += `
    <li class="list-group-item mb-1">
        <div class="card" style="min-width: 18rem">
        <div class="card-body">
            <h5 class="card-title mb-3">${apt.querySelector("아파트").textContent}</h5>
            <h6 class="card-subtitle mb-1">거래금액: ${
              apt.querySelector("거래금액").textContent + "만원"
            }</h6>
            <p class="m-0 text-muted">면적: ${apt.querySelector("전용면적").textContent}</p>
            <p class="m-0 text-muted">층: ${apt.querySelector("층").textContent}</p>
            <p class="card-text">${date}</p>
        </div>
        </div>
    </li>
        `;
  });
}
