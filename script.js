console.clear();


/*

Test Class

*/

class MarkerOperaion
{
  constructor(initdata)
  {
    this.map = initdata.map;
    this.lat = initdata.lat;
    this.lng = initdata.lng;
    this.mark= null;
  }
  
  UpdateCurrentPosition(lat,lon)
  {    
    let latitude  = lat;
    let longitude = lon;
    let map       = this.map;
    //console.log('AddCurrentPosition',latitude,longitude,map)

    //設定圖示樣式
    let myIcon = L.divIcon(
      {
        className: 'marker',
        html :'<span class="sonar-marker"></span>',    
      }); 

    if(this.mark!=null)
        this.mark.remove();
      
    //標示
    this.mark = L.marker([latitude, longitude],{icon: myIcon}).addTo(this.map);   
    
    return (this.mark);
  }
  
  
  GetCurrentMap()
  {    
    return this.map
  }
}



CityTable={
 "臺北市" : "Taipei"          ,
 "新北市" : "NewTaipei"       ,
 "桃園市" : "Taoyuan"         ,
 "臺中市" : "Taichung"        ,
 "臺南市" : "Tainan"          ,
 "高雄市" : "Kaohsiung"       ,
 "基隆市" : "Keelung"         ,
 "新竹市" : "Hsinchu"         ,
 "新竹縣" : "HsinchuCounty"   ,
 "苗栗縣" : "MiaoliCounty"    ,
 "彰化縣" : "ChanghuaCounty"  ,
 "南投縣" : "NantouCounty"    ,
 "雲林縣" : "YunlinCounty"    ,
 "嘉義縣" : "ChiayiCounty"    ,
 "嘉義市" : "Chiayi"          ,
 "屏東縣" : "PingtungCounty"  ,
 "宜蘭縣" : "YilanCounty"     ,
 "花蓮縣" : "HualienCounty"   ,
 "臺東縣" : "TaitungCounty"   ,
 "金門縣" : "KinmenCounty"    ,
 "澎湖縣" : "PenghuCounty"   // ,
 //"連江縣" : "LienchiangCounty"  
}


function GetAuthorizationHeader() 
{
    let AppID     = 'cdf9183d978d4baa8f4f89c78958fe7b';
    let AppKey    = 'eTnD0vn-Gb2_lRWAO27tXb6IGYM';
    let GMTString = new Date().toGMTString();
    let ShaObj    = new jsSHA('SHA-1', 'TEXT');
  
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    let HMAC = ShaObj.getHMAC('B64');
    let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

    return { 'Authorization': Authorization, 'X-Date': GMTString }; 
}

async function ReturnHttpGetPromise(Url)
{
  const config = {
    url    :  Url,
    method : 'get', 
    headers: GetAuthorizationHeader(),
  }
  
  try{
    const AxiosPromise = await axios(config);
    return AxiosPromise;
  }catch (error) {
    
    UpdateStatusBar(`連線失敗`,'Error');
    return AxiosPromise;
  }
    
}





/*
  //取得指定[縣市]的公共自行車租借站位資料
  https://ptx.transportdata.tw/MOTC/v2/Bike/Station/${City}?

  //取得指定[縣市]的公共自行車租借站位資料
  https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/${City}?
  
  //取得指定[位置,範圍]的全臺公共自行車租借站位資料
  https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?$spatialFilter=nearby(${Lat}%2C${Lon}%2C${Distance})
  
  //取得指定[位置,範圍]的全臺公共自行車即時車位資料
  https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?$spatialFilter=nearby(${Lat}%2C${Lon}%2C${Distance})

*/
/* 建立API URL */

function InitialBikeURL(City='',Location='',Distance='',tpye='')
{ 
  const BaseURL = 'https://ptx.transportdata.tw/MOTC/';  
  let AppendURL;
  
  switch (tpye)
  {
    case 'BikeStop':      
      AppendURL  =`v2/Bike/Station/${City}?`;
      break;
      
    case 'BikeCount':
      AppendURL  = `/v2/Bike/Availability/${City}?`; 
      break;
      
    case 'BikeNearStop':
      AppendURL  = `/v2/Bike/Station/NearBy?$spatialFilter=nearby(${Location.PositionLat},${Location.PositionLon},${Distance})&`;
      break;
      
   case 'BikeNearCount':
      AppendURL  = `/v2/Bike/Availability/NearBy?$spatialFilter=nearby(${Location.PositionLat},${Location.PositionLon},${Distance})&`;
      break;   
      
  }
  
  let FullUrl      = BaseURL+AppendURL+'$format=JSON';
  //let DirectionFilter = "$filter=Direction%20eq%20'0'";
  //console.log(FullUrl)
  return encodeURI(FullUrl);  
  
}


function sec2time(timeInSeconds) {
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60),
    milliseconds = time.slice(-3);

    //return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
    return pad(minutes, 2) + '分' + pad(seconds, 2) +'秒';
}


function UpdateStatusBar(UpdateMsg,Type)
{
  let Statuslement = document.getElementById("Status");
  let AlertType;
  switch(Type)
  {
    case 'Success':
      AlertType ='class= "alert alert-success"';
      break;
    case 'Error':
      AlertType ='class= "alert alert-danger"';
      break;  
    case 'Warning':
      AlertType ='class= "alert alert-warning"';
      break;  
    case 'Info':
      AlertType ='class= "alert alert-info"';
      break;      
  }   
  
  let StatusTemplate=`\
      <div ${AlertType} role="alert">\
      ${UpdateMsg}\
      </div>`; 
  //console.log(StatusTemplate)
 
  
  Statuslement.innerHTML = StatusTemplate;
  //console.log(Statuslement.innerHTML)
}



//移除前次搜尋結果表格
function RemovePreviosResult()
{ 
  let DivElementForward  = document.getElementById("BusTable");
  let DivElementBackword = document.getElementById("BusTableBack");
  let FoundTableForward  = document.querySelector('#BusTable table[class="table  table-striped"]'); 
  let FoundTableBackword = document.querySelector('#BusTableBack table[class="table  table-striped"]');

  if (FoundTableForward!=null)
    DivElementForward.removeChild(FoundTableForward);
  if (FoundTableBackword!=null)    
    DivElementBackword.removeChild(FoundTableBackword);
}

/*使用Naive JS 建立 Table*/
function CreateTable(DataList,Direction)
{  
  
  let BusName    = DataList[0]['RouteName'];
  let UpdateTime = DataList[0]['UpdateTime'];
  UpdateTime = UpdateTime.replace('+08:00','')
  UpdateTime = UpdateTime.replace('T','    ');
  
  let DivElement;
  
  if(Direction==0)
    DivElement = document.getElementById("BusTable");
  if(Direction==1)
    DivElement = document.getElementById("BusTableBack");
  
  //顯示公車資料更新時間 
  UpdateStatusBar(`上次更新時間 - ${UpdateTime}`,'Success');
  
  //移除前次搜尋結果 去程與回程表格
  let FoundTable;
  if(Direction==0)
    FoundTable = document.querySelector('#BusTable table[class="table  table-striped"]');
  if(Direction==1)
    FoundTable = document.querySelector('#BusTableBack table[class="table  table-striped"]');
  if (FoundTable!=null)
    DivElement.removeChild(FoundTable);

  
  
  
  let TableFragment = document.createDocumentFragment();
  
  //Create Table Tag
  let TableTag = document.createElement("table");  
  TableTag.setAttribute('class', 'table  table-striped'); 
  TableTag.innerHTML =`\
    <thead class="table-info">\
        <tr>\            
            <th>${BusName} 站名${Direction?'(回程)':'(去程)'}</th>\
            <th>預估抵達時間</th>\
        </tr>\
    </thead>\
    <tbody>\
    </tbody>`; 

  let TableBodyElement = TableTag.querySelector('tbody');  
  
  //建立表格
  DataList.forEach(function(val)
  {
    let StopOrder    = val.StopSequence;
    let StopName     = val.StopName.Zh_tw;
    let EstimateTime = val.EstimateTime;
    let StopStatus   = val.StopStatus ;
    let FormatedTime;
    switch(StopStatus)
    {
      case 0:  
        if (EstimateTime != null)
        {
          FormatedTime = sec2time(Math.floor(parseInt(EstimateTime)));
        }
        else
        {
          FormatedTime ='尚未發車';
        }
        break;
      case 1:
        FormatedTime ='尚未發車';
        if (EstimateTime>0)
        {
          FormatedTime+= '<br>';
          FormatedTime+= '預計'+sec2time(Math.floor(parseInt(EstimateTime)))+'後發車'          
        }
        break;
      case 2:
        FormatedTime ='交管不停靠';
        break;  
      case 3:
        FormatedTime ='末班車已過';
        break;  
     case 4:
        FormatedTime ='今日未營運';
        break; 
      default:
        FormatedTime ='N/A'
        break;
        
    }
    
   // let FormatedTime = sec2time(Math.floor(parseInt(EstimateTime)));
    let TdTagTemplate = `\
      <td>${ StopName }</td>\
      <td>${ FormatedTime }</td>`;   
    
    let tr = document.createElement("tr");
    tr.innerHTML =TdTagTemplate; 
    TableBodyElement.appendChild(tr)  
  });

  // 最後將組合完成的 Table 放進 Div 
  DivElement.appendChild(TableTag);
  
}

function NaiveJS()
{
  /*
     [Step 1] - Bind Listener for button
     [Steo 2] - Search Bus 
     [Step 3] - List Result to Table
  */
  //Find Button Element
  let SearchButtonEmement = document.querySelector('#button-search');
  
  //Bind Listener for button
  SearchButtonEmement.addEventListener("click", function(){
    
    //幾路公車
    let InputBusVal = document.querySelector('input').value;
    //console.log(InputBusVal)
    
    /*
      取出 地區 跟 公車號 
      Ex: [新北市]265區  取出"新北市" 與 "265區"
    */
    let CityPattern ='\\[...\]';
    let CityExtract = InputBusVal.match(CityPattern);
    let BusNum = InputBusVal.replace(CityExtract,'');
    let City = CityExtract[0].replace('[','').replace(']','');
    City = CityTable[City];
    
    // console.log(InputBusVal)
    // console.log(City)
    // console.log(BusNum)
   
    //取得公車每站抵達時間
    GetBusArriveTime(City,BusNum)
});
}



function findKey (obj,value, compare = (a, b) => a === b) 
{  
  return Object.keys(obj).find(k => compare(obj[k], value))
}



function GetBusNumberList(City)
{  
  UpdateStatusBar('公司路線更新中...待完成後再行搜尋','Warning')
  let AllBuspUrl  = InitialCityBusURL(City,'','AllBusNum');
  let AllBusList=[];
  const Promise = ReturnHttpGetPromise(AllBuspUrl)
    .then(res => 
    {  
      //console.log(res.data)      
      let AllBusNumRawData = res.data;
      
      //取出公車名稱 並存於陣列
      for(let bus in AllBusNumRawData)
        AllBusList.push(AllBusNumRawData[bus].RouteName.Zh_tw)

      //公車列表排序 - 看起來依序排列比較爽
      AllBusList.sort()
     
      /*將公車列表 增加到 input datalist中*/
      let DatListElement = document.getElementById("ShowDataList");
      let DataList;      
      for(let idx=0;idx<AllBusList.length;idx++)
      {        
        let ListString = `[${findKey(CityTable,City)}]`+`${AllBusList[idx]}`;
        //console.log(ListString)
        let Template = `<option value=${ListString}>`;

        DataList+=Template;
      }     
      DatListElement.innerHTML += DataList;
      
      UpdateStatusBar('公司路線更新完成','Info')
    
    })
    .catch(function (error) {
      // handle error
      console.log('[GetBusNumberList]',error);
    }); 
                                      
  
}


/**********************************************************************************
*
*
*           串AIP 函數區
*
*
***********************************************************************************/
async function ListBikeStop(City) 
{  
    let BikeStopUrl  = InitialBikeURL(City,'','','BikeStop');
    let BikeCountUrl = InitialBikeURL(City,'','','BikeCount');
    
    const Promise_BikeStop  = ReturnHttpGetPromise(BikeStopUrl)
    const Promise_BikeCount = ReturnHttpGetPromise(BikeCountUrl)
    
    Promise.all([Promise_BikeStop, Promise_BikeCount])
    .then(function(RespondDataAry)
    {
      let Resp_BikeStop  = RespondDataAry[0].data;
      let Resp_BikeCount = RespondDataAry[1].data;
      //console.log(Resp_BikeStop)
      //console.log(Resp_BikeCount)  
      let MarkesDeetail=[];
      
      Resp_BikeStop.forEach(function(Bike,idx)
      {
        
        let TestCompareID = Bike.StationUID;
        let BikeCount     = Resp_BikeCount.filter(function(item){return (item.StationUID == TestCompareID)})      
        
        let AvailableRentBikes   = 0;
        let AvailableReturnBikes = 0;
        let MarkColor            = '000000';
        let ServiceStatus        = 0;
        if(BikeCount)
        {
          AvailableRentBikes   = BikeCount[0].AvailableRentBikes;
          AvailableReturnBikes = BikeCount[0].AvailableReturnBikes;
          ServiceStatus        = BikeCount[0].ServiceStatus ;
          if(AvailableRentBikes<5)
            MarkColor = 'FF0000';
          else
            MarkColor = '008000';
        }
        let StatusText =''
        switch(ServiceStatus)
        {
          case 0:
            MarkColor  = '000000';
            //StatusText = '停止營運'
            StatusText   = '<span style="color: #ff0000;">停止營運</span>'
            break;
          case 1:           
            //StatusText = '正常營運'
            StatusText   = '<span style="color: #339966;">正常營運</span>'
            break;   
            
          case 2:
            MarkColor = 'FFD700';
            //StatusText = '暫停營運'
            StatusText   = '<span style="color: #FFD700;">暫停營運</span>'
            break;  
        }
        
        let DescriptionTemplate=`<p><strong>${Bike.StationName.Zh_tw}</strong></p>\
                                <p><strong>${StatusText}</strong></p>\
                                <hr />\
                                <p>可借 : ${AvailableRentBikes}</p>\
                                <p>空位 : ${AvailableReturnBikes}</p>\
                                <p>更新時間  ${Bike.UpdateTime}</p>`;
        let MarkInfo={          
          MarkerObj : null,
          latitude  : Bike.StationPosition.PositionLat,
          longitude : Bike.StationPosition.PositionLon,
          description : DescriptionTemplate,//Bike.StationName.Zh_tw
          MarkIcon    :{number:`${AvailableRentBikes}`,color:MarkColor}
        }
        MarkesDeetail.push(MarkInfo);       
        
      })
      
      leafletMarkerBatch(map,MarkesDeetail)      
      
    }).catch(function (error) {
      // handle error
      console.log('[ListBikeStop]',error);
      //UpdateStatusBar(`取得公車路線 or 時間失敗`,'Error');
     // RemovePreviosResult();
    });

}



async function ListBikeNearStop(Position,distance=1000) 
{  
    let BikeStopUrl  = InitialBikeURL('',Position,distance,'BikeNearStop');
    let BikeCountUrl = InitialBikeURL('',Position,distance,'BikeNearCount');
    
    const Promise_BikeStop  = ReturnHttpGetPromise(BikeStopUrl)
    const Promise_BikeCount = ReturnHttpGetPromise(BikeCountUrl)
    
    Promise.all([Promise_BikeStop, Promise_BikeCount])
    .then(function(RespondDataAry)
    {
      let Resp_BikeStop  = RespondDataAry[0].data;
      let Resp_BikeCount = RespondDataAry[1].data;
      //console.log(Resp_BikeStop)
      //console.log(Resp_BikeCount)  
      let MarkesDeetail=[];
      
      Resp_BikeStop.forEach(function(Bike,idx)
      {
        
        let TestCompareID = Bike.StationUID;
        let BikeCount     = Resp_BikeCount.filter(function(item){return (item.StationUID == TestCompareID)})   
        let BikeUpdateTime= Bike.UpdateTime;
        BikeUpdateTime = BikeUpdateTime.replace('+08:00','')
        BikeUpdateTime = BikeUpdateTime.replace('T','    ');
        
        let AvailableRentBikes   = 0;
        let AvailableReturnBikes = 0;
        let MarkColor            = '000000';
        let ServiceStatus        = 0;
        if(BikeCount)
        {
          AvailableRentBikes   = BikeCount[0].AvailableRentBikes;
          AvailableReturnBikes = BikeCount[0].AvailableReturnBikes;
          ServiceStatus        = BikeCount[0].ServiceStatus ;          
        }
        let StatusText =''
        let MarkIconCfg;
        switch(ServiceStatus)
        {
          case 0:
            StatusText   = '<span style="color: #ff0000;">停止營運</span>';
            MarkIconCfg  = {  IconURL: 'https://assets.mapquestapi.com/icon/v2/marker-end.png'
                              };    
            break;
          case 1:
            if(AvailableRentBikes<5)
              MarkColor = 'FF0000';
            else
              MarkColor = '008000';
            
            StatusText   = '<span style="color: #339966;">正常營運</span>'
            MarkIconCfg  = {  IconURL: `https://assets.mapquestapi.com/icon/v2/marker-lg-${MarkColor}-${AvailableRentBikes}.png`};
            break;   
            
          case 2:
            StatusText   = '<span style="color: #FFD700;">暫停營運</span>'
            MarkIconCfg  = {  IconURL: 'https://assets.mapquestapi.com/icon/v2/marker--000000-F8E71C.png'};
           
            //https://assets.mapquestapi.com/icon/v2/construction-lg.png
            break;  
        }
        
        let DescriptionTemplate=`<p><strong>${Bike.StationName.Zh_tw}</strong></p>\
                                <p><strong>${StatusText}</strong></p>\
                                <hr />\
                                <p>可借 : ${AvailableRentBikes}</p>\
                                <p>空位 : ${AvailableReturnBikes}</p>\
                                <p>更新時間  ${BikeUpdateTime}</p>`;        
        
        let MarkInfo={          
          MarkerObj   : null,
          latitude    : Bike.StationPosition.PositionLat,
          longitude   : Bike.StationPosition.PositionLon,
          description : DescriptionTemplate,     
          MarkIcon    : MarkIconCfg  ,         
                       
        }
        MarkesDeetail.push(MarkInfo);       
        
      })
      
      leafletMarkerBatch(map,MarkesDeetail)      
      
    }).catch(function (error) {
      // handle error
      console.log('[ListBikeStop]',error);
      //UpdateStatusBar(`取得公車路線 or 時間失敗`,'Error');
     // RemovePreviosResult();
    });

}

/**********************************************************************************
*
*
*           Leaflet 函數區
*
*
***********************************************************************************/
function InitMap(location)
{
  // 建立 Leaflet 地圖
  let map = L.map('mapid');
  
  //設定經緯度
  let latitude  = location.PositionLat;
  let longitude = location.PositionLon;

  // 設定經緯度座標
  map.setView(new L.LatLng(latitude,longitude), 18);    
 
  /*加入比例尺*/
  L.control.scale().addTo(map); 
  
  // 設定圖資來源
  let osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let osm = new L.TileLayer(osmUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    ,minZoom: 3, maxZoom: 19});
  map.addLayer(osm);
  
  return map
  
}

function AddCurrentPosition(map,location)
{  
  let latitude  = location.PositionLat;
  let longitude = location.PositionLon;
  
  //設定圖示樣式
  let myIcon = L.divIcon(
    {
      className: 'marker',
      html :'<span class="sonar-marker"></span>',    
    }); 
  
  //標示
  let marker = L.marker([latitude, longitude],{icon: myIcon}).addTo(map);
  
  return marker;  
}

function MoveCurrentPosition(map,marker,Position)
{  
  marker.setLatLng([Position.PositionLat,Position.PositionLon]).addTo(map)
  map.setView(new L.LatLng(Position.PositionLat,Position.PositionLon), 18); 
}

/*  批次加入數量標示點*/
function leafletMarkerBatch(Map,MarkesDetail)
{  
 
  let markerSize        = {'sm': [28, 35], 'md': [35, 44], 'lg': [42, 53]};
  let markerAnchor      = {'sm': [14, 35], 'md': [17, 44], 'lg': [21, 53]};
  let markerPopupAnchor = {'sm': [1, -35], 'md': [1, -44], 'lg': [2, -53]};  
 
  MarkesDetail.forEach((mark)=>
  {     
    let IconWithNumberUrl = mark.MarkIcon.IconURL;
    
    let smallMarker = L.icon({    
    iconRetinaUrl: IconWithNumberUrl,
    iconSize     : markerSize.sm,
    iconAnchor   : markerAnchor.sm,
    popupAnchor  : markerPopupAnchor.sm
  });

    let OneMark = L.marker([mark.latitude, mark.longitude], {icon:smallMarker}).addTo(Map);    
    OneMark.bindPopup(`${mark.description}`);   
    mark.MarkerObj = OneMark
  })
}



function ListMyNearBike(CurrentPostion)
{
  console.log('[Function Name]',ListMyNearBike.name)
  
  let map = CurrentPostion.GetCurrentMap();
  
  /* 得到目前 所在經緯度*/ 
  navigator.geolocation.getCurrentPosition( function(position)
    {
      //console.log(position)
      //console.log(position.coords.latitude,position.coords.longitude)
      let Position={
      PositionLon:position.coords.longitude,
      PositionLat:position.coords.latitude,    
    }      
    
    //取得目前所在位置 並標示
    let marker = CurrentPostion.UpdateCurrentPosition(Position.PositionLat,Position.PositionLon)
    
    MoveCurrentPosition(map,marker,Position)
    
    //u62j/4
    map.setView(new L.LatLng(position.coords.latitude,position.coords.longitude), map.getZoom());
    
    ListBikeNearStop(Position,distance=1000)
    },
    (e) => console.log('error',e));

}




/**********************************************************************************
*
*
*           Test 函數區
*
*
***********************************************************************************/
function TestBikAPI(map)
{
  //Test Value
  let City = CityTable['新北市'];
  let Position={
    PositionLon:121.517055,
    PositionLat:25.047675,    
  }
  
  let Url = InitialBikeURL(City,Position,500,'BikeStop');
// BikeStop
// BikeCount
// BikeNearStop
// BikeNearCount

  //console.log(Url)
  const Promise = ReturnHttpGetPromise(Url)
    .then(res => 
    {  
     // console.log(res.data)
      let BikesData = res.data;
      let MarkesDeetail=[];
      
      BikesData.forEach(function(Bike,idx)
      {
        let DescriptionTemplate=`<p><strong>${Bike.StationName.Zh_tw}</strong></p>\
                                <hr />\
                                <p>可借 : XX</p>\
                                <p>空位 : OO</p>`;
        let MarkInfo={          
          MarkerObj : null,
          latitude  : Bike.StationPosition.PositionLat,
          longitude : Bike.StationPosition.PositionLon,
          description : DescriptionTemplate,//Bike.StationName.Zh_tw
          MarkIcon    :{number:10,color:'ff0000'}
        }
        MarkesDeetail.push(MarkInfo);
        // if(idx==0)
        //   console.log(MarkInfo)
        
      })
      leafletMarkerBatch(map,MarkesDeetail)
      
      //CreateTable(BusStopOrder);      
   
    })
    .catch(function (error) {
      // handle error
      console.log('[TestBikAPI]',error);
    }); 
  
  
}


/* 更新站列表*/

  /*繪製地圖*/
  let Position={
    PositionLon:120.982024,
    PositionLat:23.973875,    
  }
  let map = InitMap(Position);

  let cfg = {
    map:map,
    lat:Position.PositionLat, 
    lng:Position.PositionLon,

  };
  CurrentPostion = new MarkerOperaion(cfg);

  // let marker = AddCurrentPosition(map,Position);
  // Position.PositionLon = 121.567904444;
  // Position.PositionLat = 25.0408578889;
  // MoveCurrentPosition(map,marker,Position)
  
  //TestBikAPI(map);
  // let City = CityTable['新北市'];
  // ListBikeStop(City);

  // City = CityTable['臺北市'];
  // ListBikeStop(City);
  //ListBikeNearStop(Position,distance=1000)


  /*列出目前所在位置附近的站點*/
  ListMyNearBike(CurrentPostion);

  /*拖動地圖後,列出所在地附近站點*/
  map.on('dragend',function(e)
    {
          let NewLocate={
            PositionLon:map.getCenter().lng,
            PositionLat:map.getCenter().lat,    
          };
          // console.log('Drag End'); 
          // console.log(map.getCenter());
          ListBikeNearStop(NewLocate,distance=1000);    
   })

/* 使用 Javascript 原生 DOM 方式 監聽按鈕後建立表格*/
// NaiveJS();



//加入按鈕 - 移動到目前位置並搜尋附近車站
L.easyButton( '<span class="star">&#x1F3AF;</span>', function(){
  ListMyNearBike(CurrentPostion);
}).addTo(map);



// testnow.UpdateCurrentPosition(25.06234670660817, 121.64817745388834)

//每隔6秒更新目前所在位置,並列其附近車輛
setInterval(function()
  { 
    console.log('[Update] Current Location')
     let map = CurrentPostion.GetCurrentMap();
  
    /* 得到目前 所在經緯度*/ 
    navigator.geolocation.getCurrentPosition( function(position)
    {
        //console.log(position)
        //console.log(position.coords.latitude,position.coords.longitude)
        let Position={
          PositionLon:position.coords.longitude,
          PositionLat:position.coords.latitude,    
        }
      CurrentPostion.UpdateCurrentPosition(Position.PositionLat,Position.PositionLon);
      ListBikeNearStop(Position,distance=300)
    });
  }, 6000);