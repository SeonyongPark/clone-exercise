var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 6, // 지도의 확대 레벨
  };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();
// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// HTML5의 geolocation으로 사용할 수 있는지 확인합니다
if (navigator.geolocation) {
  // GeoLocation을 이용해서 접속 위치를 얻어옵니다
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude, // 위도
      lon = position.coords.longitude; // 경도

    (myLatLng = new kakao.maps.LatLng(lat, lon)), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
      // 마커와 인포윈도우를 표시합니다
      displayMarker(myLatLng, "");

    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(myLatLng);
  });
} else {
  // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
  (myLatLng = new kakao.maps.LatLng(37.5012743, 127.039585)), // 위치
    displayMarker(myLatLng, "");
}

////////////////////////////////////// 초기 설정 끝 ///////////////////////////////

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(myLatLng, message, markerImage) {
  // 마커를 생성합니다
  var marker = new kakao.maps.Marker({
    map: map,
    position: myLatLng,
    image: markerImage, // 마커이미지 설정
  });

  if (message) {
    var date =
      message.querySelector("년").textContent +
      "." +
      message.querySelector("월").textContent +
      "." +
      message.querySelector("일").textContent;

    var iwContent = `
    <li class="list-group-item mb-1">
        <div class="card" style="min-width: 18rem">
        <div class="card-body">
            <h5 class="card-title mb-3">${message.querySelector("아파트").textContent}</h5>
            <h6 class="card-subtitle mb-1">거래금액: ${
              message.querySelector("거래금액").textContent + "만원"
            }</h6>
            <p class="m-0 text-muted">면적: ${message.querySelector("전용면적").textContent}</p>
            <p class="m-0 text-muted">층: ${message.querySelector("층").textContent}</p>
            <p class="card-text">${date}</p>
        </div>
        </div>
    </li>
    `, // 인포윈도우에 표시할 내용
      iwRemoveable = true;

    // 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: iwContent,
      removable: iwRemoveable,
    });
  }

  // 마커에 마우스오버 이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "mouseover", function () {
    // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
    infowindow.open(map, marker);
  });

  // 마커에 마우스아웃 이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "mouseout", function () {
    // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
    infowindow.close();
  });
}

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();
// 마커 이미지의 이미지 주소입니다
var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
// 마커 이미지의 이미지 크기 입니다
var imageSize = new kakao.maps.Size(24, 35);
// 마커 이미지를 생성합니다
var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

function mapMarker(address, data) {
  let parser = new DOMParser();
  const xml = parser.parseFromString(data, "application/xml");
  let apts = xml.querySelectorAll("item");

  // 검색 주소 기준으로 지도 중심 이동
  geocoder.addressSearch(address, function (result, status) {
    // 정상적으로 검색이 완료됐으면
    if (status === kakao.maps.services.Status.OK) {
      var myLatLng = new kakao.maps.LatLng(result[0].y, result[0].x);
      map.setCenter(myLatLng);
    }
  });

  // 매매 정보 주소를 좌표로 변환하기
  apts.forEach(async (apt) => {
    let location =
      apt.querySelector("법정동").textContent + " " + apt.querySelector("지번").textContent;

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(location, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        displayMarker(coords, apt, markerImage);
      }
    });
  });
}
