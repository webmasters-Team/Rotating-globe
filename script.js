/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 
 var paris = imageSeries.mapImages.create();
paris.latitude = 48.856614;
paris.longitude = 2.352222;

var nyc = imageSeries.mapImages.create();
nyc.latitude = 40.712776;
nyc.longitude = -74.005973;

https://www.amcharts.com/docs/v4/chart-types/map/
 
 */

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var container = am4core.create("chartdiv", am4core.Container);
container.width = am4core.percent(100);
container.height = am4core.percent(100);
container.layout = "horizontal";


// MAP MORPHING
var mapMorphing = container.createChild(am4maps.MapChart);
mapMorphing.padding(20, 0, 0, 0);
mapMorphing.width = am4core.percent(100);

try {
    mapMorphing.geodata = am4geodata_worldHigh;
}
catch (e) {
    mapMorphing.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

mapMorphing.projection = new am4maps.projections.Mercator();

// zoomout on background click
mapMorphing.chartContainer.background.events.on("hit", function () { zoomOut() });

var polygonSeriesMorph = mapMorphing.series.push(new am4maps.MapPolygonSeries());
polygonSeriesMorph.useGeodata = true;
polygonSeriesMorph.exclude = ["AQ"];


//polygonSeriesMorph.calculateVisualCenter = true;
var templateMorph = polygonSeriesMorph.mapPolygons.template;
templateMorph.nonScalingStroke = true;
templateMorph.fill = am4core.color("#ececec");
templateMorph.stroke = am4core.color("#fff");
templateMorph.fillOpacity = 1;

let activeCountries = ["IT", "CH", "FR", "DE", "GB", "ES", "IE", "LU", "BE", "AT", "DK", "NO", "JP", "AU", "US"];

mapMorphing.events.on("ready", function(ev) {
  // Init extremes
  var north, south, west, east;

  // Find extreme coordinates for all pre-zoom countries
  for(let i = 0; i < activeCountries.length; i++) {
    var country = polygonSeries.getPolygonById(activeCountries[i]);
    if (north == undefined || (country.north > north)) {
      north = country.north;
    }
    if (south == undefined || (country.south < south)) {
      south = country.south;
    }
    if (west == undefined || (country.west < west)) {
      west = country.west;
    }
    if (east == undefined || (country.east > east)) {
      east = country.east;
    }
    country.isActive = true
  }

  // Pre-zoom
  mapMorphing.zoomToRectangle(north, east, south, west, 1.2, true);
});


var colorSet = new am4core.ColorSet();
var morphedPolygon;

// map polygon series (countries)
var polygonSeries = mapMorphing.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
// specify which countries to include
polygonSeries.include = activeCountries;
polygonSeries.calculateVisualCenter = true;
// country area look and behavior
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.strokeOpacity = 1;
polygonTemplate.stroke = am4core.color("#ffffff");
polygonTemplate.fillOpacity = 0.5;
polygonTemplate.tooltipText = "{name}";

// desaturate filter for countries
var desaturateFilter = new am4core.DesaturateFilter();
desaturateFilter.saturation = 0.25;
polygonTemplate.filters.push(desaturateFilter);

// take a color from color set

polygonTemplate.adapter.add("fill", function (fill, target) {
    return colorSet.getIndex(target.dataItem.index + 1);
})


// set fillOpacity to 1 when hovered
var hoverState = polygonTemplate.states.create("hover");
hoverState.properties.fillOpacity = 1;

// what to do when country is clicked
polygonTemplate.events.on("hit", function (event) {
    event.target.zIndex = 1000000;
    selectPolygon(event.target);
})

// Pie chart
var pieChart = mapMorphing.seriesContainer.createChild(am4charts.PieChart);
// Set width/heigh of a pie chart for easier positioning only
pieChart.width = 100;
pieChart.height = 100;
pieChart.hidden = true; // can't use visible = false!

// because defauls are 50, and it's not good with small countries
pieChart.chartContainer.minHeight = 1;
pieChart.chartContainer.minWidth = 1;

var pieSeries = pieChart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = "value";
pieSeries.dataFields.category = "category";
pieSeries.data = [{ value: 100, category: "First" }, { value: 20, category: "Second" }, { value: 10, category: "Third" }];

var dropShadowFilter = new am4core.DropShadowFilter();
dropShadowFilter.blur = 4;
pieSeries.filters.push(dropShadowFilter);

var sliceTemplate = pieSeries.slices.template;
sliceTemplate.fillOpacity = 1;
sliceTemplate.strokeOpacity = 0;

var activeState = sliceTemplate.states.getKey("active");
activeState.properties.shiftRadius = 0; // no need to pull on click, as country circle under the pie won't make it good

var sliceHoverState = sliceTemplate.states.getKey("hover");
sliceHoverState.properties.shiftRadius = 0; // no need to pull on click, as country circle under the pie won't make it good

// we don't need default pie chart animation, so change defaults
var hiddenState = pieSeries.hiddenState;
hiddenState.properties.startAngle = pieSeries.startAngle;
hiddenState.properties.endAngle = pieSeries.endAngle;
hiddenState.properties.opacity = 0;
hiddenState.properties.visible = false;

// series labels
var labelTemplate = pieSeries.labels.template;
labelTemplate.nonScaling = true;
labelTemplate.fill = am4core.color("#FFFFFF");
labelTemplate.fontSize = 10;
labelTemplate.background = new am4core.RoundedRectangle();
labelTemplate.background.fillOpacity = 0.9;
labelTemplate.padding(4, 9, 4, 9);
labelTemplate.background.fill = am4core.color("#7678a0");

// we need pie series to hide faster to avoid strange pause after country is clicked
pieSeries.hiddenState.transitionDuration = 200;

// country label
var countryLabel = mapMorphing.chartContainer.createChild(am4core.Label);
countryLabel.text = "Select a country";
countryLabel.fill = am4core.color("#000");
countryLabel.fontSize = 18;

countryLabel.hiddenState.properties.dy = 1000;
countryLabel.defaultState.properties.dy = 0;
countryLabel.valign = "top";
countryLabel.align = "left";
countryLabel.paddingLeft = 25;
countryLabel.paddingTop = 0;
countryLabel.hide(0);
//countryLabel.show();

// select polygon
function selectPolygon(polygon) {
    if (morphedPolygon != polygon) {
        var animation = pieSeries.hide();
        if (animation) {
            animation.events.on("animationended", function () {
                morphToCircle(polygon);
            })
        }
        else {
            morphToCircle(polygon);
        }
    }
}

// fade out all countries except selected
function fadeOut(exceptPolygon) {
    for (var i = 0; i < polygonSeries.mapPolygons.length; i++) {
        var polygon = polygonSeries.mapPolygons.getIndex(i);
        if (polygon != exceptPolygon) {
            polygon.defaultState.properties.fillOpacity = 0.5;
            polygon.animate([{ property: "fillOpacity", to: 0.5 }, { property: "strokeOpacity", to: 1 }], polygon.polygon.morpher.morphDuration);
        }
    }
}

function zoomOut() {
    if (morphedPolygon) {
        pieSeries.hide();
        morphBack();
        fadeOut();
        countryLabel.hide();
        morphedPolygon = undefined;
    }
}

function morphBack() {
    if (morphedPolygon) {
        morphedPolygon.polygon.morpher.morphBack();
        var dsf = morphedPolygon.filters.getIndex(0);
        dsf.animate({ property: "saturation", to: 0.25 }, morphedPolygon.polygon.morpher.morphDuration);
    }
}

function morphToCircle(polygon) {


    var animationDuration = polygon.polygon.morpher.morphDuration;
    // if there is a country already morphed to circle, morph it back
    morphBack();
    // morph polygon to circle
    polygon.toFront();
    polygon.polygon.morpher.morphToSingle = true;
    var morphAnimation = polygon.polygon.morpher.morphToCircle();

    polygon.strokeOpacity = 0; // hide stroke for lines not to cross countries

    polygon.defaultState.properties.fillOpacity = 1;
    polygon.animate({ property: "fillOpacity", to: 1 }, animationDuration);

    // animate desaturate filter
    var filter = polygon.filters.getIndex(0);
    filter.animate({ property: "saturation", to: 1 }, animationDuration);

    // save currently morphed polygon
    morphedPolygon = polygon;

    // fade out all other
    fadeOut(polygon);

    // hide country label
    countryLabel.hide();

    if (morphAnimation) {
        morphAnimation.events.on("animationended", function () {
            zoomToCountry(polygon);
        })
    }
    else {
        zoomToCountry(polygon);
    }
}

function zoomToCountry(polygon) {
    var zoomAnimation = mapMorphing.zoomToMapObject(polygon, 2.2, true);
    if (zoomAnimation) {
        zoomAnimation.events.on("animationended", function () {
            showPieChart(polygon);
        })
    }
    else {
        showPieChart(polygon);
    }
}


function showPieChart(polygon) {
    polygon.polygon.measure();
    var radius = polygon.polygon.measuredWidth / 2 * polygon.globalScale / mapMorphing.seriesContainer.scale;
    pieChart.width = radius * 2;
    pieChart.height = radius * 2;
    pieChart.radius = radius;

    var centerPoint = am4core.utils.spritePointToSvg(polygon.polygon.centerPoint, polygon.polygon);
    centerPoint = am4core.utils.svgPointToSprite(centerPoint, mapMorphing.seriesContainer);

    pieChart.x = centerPoint.x - radius;
    pieChart.y = centerPoint.y - radius;

    var fill = polygon.fill;
    var desaturated = fill.saturate(0.3);

    for (var i = 0; i < pieSeries.dataItems.length; i++) {
        var dataItem = pieSeries.dataItems.getIndex(i);
        dataItem.value = Math.round(Math.random() * 100);
        dataItem.slice.fill = am4core.color(am4core.colors.interpolate(
            fill.rgb,
            am4core.color("#ffffff").rgb,
            0.2 * i
        ));

        dataItem.label.background.fill = desaturated;
        dataItem.tick.stroke = fill;
    }

    pieSeries.show();
    pieChart.show();

    countryLabel.text = "{name}";
    countryLabel.dataItem = polygon.dataItem;
    //countryLabel.fill = desaturated;
    countryLabel.show();
}


// IMAGES

// Image series
var imageSeries = mapMorphing.series.push(new am4maps.MapImageSeries());
var imageTemplate = imageSeries.mapImages.template;
imageTemplate.propertyFields.longitude = "longitude";
imageTemplate.propertyFields.latitude = "latitude";
imageTemplate.nonScaling = true;

var image = imageTemplate.createChild(am4core.Image);
image.propertyFields.href = "imageURL";
image.width = 50;
image.height = 50;
image.horizontalCenter = "middle";
image.verticalCenter = "middle";

var label = imageTemplate.createChild(am4core.Label);
label.text = "{label}";
label.horizontalCenter = "middle";
label.verticalCenter = "top";
label.dy = 20;

imageSeries.data = [{
  "latitude": 40.416775,
  "longitude": -3.703790,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/rainy-1.svg",
  "width": 32,
  "height": 32,
  "label": "Madrid: +22C"
}, {
  "latitude": 48.856614,
  "longitude": 2.352222,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/thunder.svg",
  "width": 32,
  "height": 32,
  "label": "Paris: +18C"
}, {
  "latitude": 52.520007,
  "longitude": 13.404954,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/cloudy-day-1.svg",
  "width": 32,
  "height": 32,
  "label": "Berlin: +13C"
}, {
  "latitude": 52.229676,
  "longitude": 21.012229,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/day.svg",
  "width": 32,
  "height": 32,
  "label": "Warsaw: +22C"
}, {
  "latitude": 41.872389,
  "longitude": 12.480180,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/day.svg",
  "width": 32,
  "height": 32,
  "label": "Rome: +29C"
}, {
  "latitude": 51.507351,
  "longitude": -0.127758,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/rainy-7.svg",
  "width": 32,
  "height": 32,
  "label": "London: +10C"
}, {
  "latitude": 59.329323,
  "longitude": 18.068581,
  "imageURL": "https://www.amcharts.com/lib/images/weather/animated/rainy-1.svg",
  "width": 32,
  "height": 32,
  "label": "Stockholm: +8C"
} ];



/// ROTATING GLOBE

// Create map instance
//var chart = am4core.create("chartdiv", am4maps.MapChart);
var globe = container.createChild(am4maps.MapChart);

var interfaceColors = new am4core.InterfaceColorSet();

try {
    globe.geodata = am4geodata_worldLow;
}
catch (e) {
    globe.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

// Set projection
globe.projection = new am4maps.projections.Orthographic();
globe.panBehavior = "rotateLongLat";
globe.padding(5,0,5,0);
globe.width = am4core.percent(20);
globe.height = 600;
globe.valign = "top";

globe.homeZoomLevel = 3;


globe.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color("#18354d");
globe.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 1;
globe.deltaLongitude = 10;
globe.deltaLatitude = -3;
globe.zoomLevel = 100;
globe.maxZoomLevel = 3;


// Create map polygon series

var shadowPolygonSeries = globe.series.push(new am4maps.MapPolygonSeries());
shadowPolygonSeries.geodata = am4geodata_continentsLow;

try {
    shadowPolygonSeries.geodata = am4geodata_continentsLow;
}
catch (e) {
    shadowPolygonSeries.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

shadowPolygonSeries.useGeodata = true;
shadowPolygonSeries.dx = 2;
shadowPolygonSeries.dy = 2;
shadowPolygonSeries.mapPolygons.template.fill = am4core.color("#fff");
shadowPolygonSeries.mapPolygons.template.fillOpacity = 0;
shadowPolygonSeries.mapPolygons.template.strokeOpacity = 0;
shadowPolygonSeries.fillOpacity = 0;
shadowPolygonSeries.fill = am4core.color("#fff");


// Create map polygon series
var polygonSeries = globe.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;

polygonSeries.calculateVisualCenter = true;
polygonSeries.tooltip.background.fillOpacity = 0.2;
polygonSeries.tooltip.background.cornerRadius = 20;

var template = polygonSeries.mapPolygons.template;
template.nonScalingStroke = true;
template.fill = am4core.color("#fff");
template.stroke = am4core.color("#c2c2c2");

polygonSeries.calculateVisualCenter = true;
template.propertyFields.id = "id";
template.tooltipPosition = "fixed";
template.fillOpacity = 1;

template.events.on("over", function (event) {
    if (event.target.dummyData) {
        event.target.dummyData.isHover = true;
    }
})
template.events.on("out", function (event) {
    if (event.target.dummyData) {
        event.target.dummyData.isHover = false;
    }
})

var hs = polygonSeries.mapPolygons.template.states.create("hover");
hs.properties.fillOpacity = 1;
hs.properties.fill = am4core.color("#ffffff");


var graticuleSeries = globe.series.push(new am4maps.GraticuleSeries());
graticuleSeries.mapLines.template.stroke = am4core.color("#70fafe");
graticuleSeries.fitExtent = true;
graticuleSeries.mapLines.template.strokeOpacity = 1;
graticuleSeries.mapLines.template.stroke = am4core.color("#70fafe");


var measelsSeries = globe.series.push(new am4maps.MapPolygonSeries())
measelsSeries.tooltip.background.fillOpacity = 0;
measelsSeries.tooltip.background.cornerRadius = 20;
measelsSeries.tooltip.autoTextColor = false;
measelsSeries.tooltip.label.fill = am4core.color("#000");
measelsSeries.tooltip.dy = -5;

var measelTemplate = measelsSeries.mapPolygons.template;
measelTemplate.fill = am4core.color("#70fafe");
measelTemplate.strokeOpacity = 1;
measelTemplate.fillOpacity = 1;
measelTemplate.tooltipPosition = "fixed";



var hs2 = measelsSeries.mapPolygons.template.states.create("hover");
hs2.properties.fillOpacity = 1;
hs2.properties.fill = am4core.color("#386383");

polygonSeries.events.on("inited", function () {
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        var count = data[mapPolygon.id];

        if (count > 0){
            var polygon = measelsSeries.mapPolygons.create();
            polygon.multiPolygon = am4maps.getCircle(mapPolygon.visualLongitude, mapPolygon.visualLatitude, Math.max(0.2, Math.log(count) * Math.LN10 / 10));
            //polygon.tooltipText = mapPolygon.dataItem.dataContext.name + ": " + count;
            mapPolygon.dummyData = polygon;

            polygon.events.on("over", function () {
                return false;
            })
            polygon.events.on("out", function () {
                return false;
            })

        }



    })
})


var data = {
    "AL": 504.38,
    "AM": 6.5,
    "AO": 2.98,
    "AR": 0.32,
    "AT": 10.9,
    "AU": 5.02,
    "AZ": 17.38,
    "BA": 24.45,
    "BD": 13.4,
    "BE": 12.06,
    "BF": 93.37,
    "BG": 1.68,
    "BI": 0.95,
    "BJ": 93.36,
    "BR": 49.42,
    "BT": 10.03,
    "BY": 26.16,
    "CA": 0.96,
    "CD": 69.71,
    "CF": 4.57,
    "CG": 19.7,
    "CH": 6.19,
    "CI": 14.1,
    "CL": 1.4,
    "CM": 41.26,
    "CN": 2.6,
    "CO": 4.48,
    "CY": 7.69,
    "CZ": 23.09,
    "DK": 1.58,
    "EE": 9.91,
    "EG": 0.63,
    "ES": 4.96,
    "FI": 3.27,
    "FR": 43.26,
    "GA": 3.03,
    "GB": 14.3,
    "GE": 809.09,
    "GH": 39.78,
    "GM": 2.45,
    "GN": 45.98,
    "GQ": 23.74,
    "GR": 154.42,
    "HR": 5.46,
    "HU": 1.44,
    "ID": 16.87,
    "IE": 17.56,
    "IL": 412.24,
    "IN": 47.85,
    "IQ": 12.96,
    "IR": 1.13,
    "IT": 44.29,
    "JP": 3.27,
    "KE": 16.8,
    "KG": 253.37,
    "KH": 0.44,
    "KM": 1.26,
    "KZ": 116.3,
    "LA": 1.33,
    "LK": 0.53,
    "LR": 692.27,
    "LS": 5.9,
    "LT": 14.44,
    "LU": 6.95,
    "LV": 6.09,
    "MA": 0.2,
    "MD": 83.75,
    "ME": 319.75,
    "MG": 2386.35,
    "MK": 28.83,
    "ML": 48.68,
    "MM": 40.31,
    "MN": 0.66,
    "MR": 14.65,
    "MT": 11.65,
    "MV": 9.35,
    "MX": 0.04,
    "MY": 86.41,
    "MZ": 13.49,
    "NA": 12.9,
    "NE": 80.88,
    "NG": 31.44,
    "NL": 1.47,
    "NO": 2.47,
    "NP": 10.8,
    "NZ": 9.23,
    "PE": 1.29,
    "PK": 159.14,
    "PL": 8.24,
    "PT": 16.68,
    "RO": 63.05,
    "RS": 473.46,
    "RU": 14.24,
    "RW": 5.45,
    "SE": 2.64,
    "SG": 8.18,
    "SI": 3.37,
    "SK": 112.78,
    "SN": 3.37,
    "SO": 8.03,
    "SS": 19.3,
    "TD": 75.63,
    "TG": 34.84,
    "TH": 81.02,
    "TL": 9.46,
    "TN": 7.8,
    "TR": 7.08,
    "UA": 1439.02,
    "UG": 62.55,
    "US": 1.32,
    "UZ": 0.99,
    "VE": 179.55,
    "ZA": 3.09,
    "ZM": 9.82,
    "ZW": 0.06
}

let animation;
setTimeout(function(){
    animation = globe.animate({property:"deltaLongitude", to:100000}, 20000000);
}, 3000)

globe.seriesContainer.events.on("down", function(){
    if(animation){
        animation.stop();
    }
})
