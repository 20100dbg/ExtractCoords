function DessinerPoints(tab)
{
    for (var i = 0; i < layersPoints.length; i++) layersPoints[i].remove();
    layersPoints = [];

    for (var i = 0; i < tab.length; i++)
    {
        var pointObj = getPointObj(tab[i]);
        layersPoints.push(L.circle([pointObj.lat, pointObj.lng], {radius: 100, fill: true}).addTo(map));
    }
}

function importManuel()
{
    tabPointsImport = lireDiv('pointsIn');
    document.getElementById('labelPointsIn').innerHTML = tabPointsImport.length;
    DessinerPoints(tabPointsImport);
    centrerVue(tabPointsImport);
}

function lireDiv(div)
{
    var data = [];
    var divIn = document.getElementById(div);
    var lines = divIn.value.split('\n');

    for (var i = 0; i < lines.length; i++)
    {
        var tmp = lines[i].split(';');
        var lat = parseFloat(tmp[0]);
        var lng = parseFloat(tmp[1]);
        
        if (!isNaN(lat) && !isNaN(lng))
            data.push({lat:lat, lng:lng});
    }

    return data;
}

function ecrireDiv(div, tabPoints)
{
    var divOut = document.getElementById(div);    
    divOut.value = '';

    for (var i = 0; i < tabPoints.length; i++)
    {
        var pointObj = getPointObj(tabPoints[i]);
        divOut.value += pointObj.lat + ";" + pointObj.lng + "\n";
    }
}

function appliquerFiltre()
{
    tabPointsFiltre = filtrer(tabPointsImport);
    ecrireDiv('pointsOut', tabPointsFiltre);
    document.getElementById('labelPointsOut').innerHTML = tabPointsFiltre.length;
    DessinerPoints(tabPointsFiltre);
}

function filtrer(tabPoints)
{
    var tabPolygons = map.pm.getGeomanDrawLayers();
    var tabFiltre = [];

    for (var i = 0; i < tabPoints.length; i++)
    {
        var flagAdded = false;
        var pointObj = getPointObj(tabPoints[i]);

        for (var j = 0; j < tabPolygons.length && !flagAdded; j++)
        {
            if ("_mRadius" in tabPolygons[j])
            {
                if (IsInsideCircle(pointObj, tabPolygons[j]._latlng, tabPolygons[j]._mRadius))
                {
                    tabFiltre.push(tabPoints[i])
                    flagAdded = true;
                }
            }
            else
            {
                if (IsInsidePolygon(pointObj, tabPolygons[j]._latlngs[0]))
                {
                    tabFiltre.push(tabPoints[i])
                    flagAdded = true;
                }
            }
        }
    }
    return tabFiltre;
}

function IsInsidePolygon(posPoint, polyPoints)
{
    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++)
    {
        var xi = polyPoints[i].lng, yi = polyPoints[i].lat;
        var xj = polyPoints[j].lng, yj = polyPoints[j].lat;

        var intersect = ((yi > posPoint.lat) != (yj > posPoint.lat))
            && (posPoint.lng < (xj - xi) * (posPoint.lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function IsInsideCircle(posPoint, posCircle, radius)
{
    posPoint = new L.LatLng(posPoint.lat, posPoint.lng);
    posCircle = new L.LatLng(posCircle.lat, posCircle.lng);
    var dist = posPoint.distanceTo(posCircle);
    return (dist <= radius);
}

//import
function importFile()
{
  var fileInput = document.getElementById('fileInput');
  var fileReader = new FileReader();

  fileReader.onload = function (e) {
    var filename = fileInput.files[0].name;
    var ext = filename.substring(filename.lastIndexOf('.'));

    tabPointsImport = importCSV(fileReader.result);
    document.getElementById('labelPointsIn').innerHTML = tabPointsImport.length;
    centrerVue(tabPointsImport);
    ecrireDiv('pointsIn', tabPointsImport);
    DessinerPoints(tabPointsImport);
  }
  
  fileReader.readAsText(fileInput.files[0]);
}


function importCSV(txt)
{
  var lines = txt.split('\n');
  var data = [];
  lineHeaders = lines[0];

  for (var i = 1; i < lines.length; i++)
  {
    var tab = lines[i].trim().split(';');
    tab[0] = parseFloat(tab[0]);
    tab[1] = parseFloat(tab[1]);
        
    if (!isNaN(tab[0]) && !isNaN(tab[1]))
        data.push(tab);
  }

  return data;
}

function getPointObj(tabLine)
{
    return {lat: tabLine[0], lng: tabLine[1]};
}

function findBounds(tabPoints)
{
    var pointObj = getPointObj(tabPoints[0]);
    var N = pointObj.lat, S = pointObj.lat, E = pointObj.lng, W = pointObj.lng;

    for (var i = 1; i < tabPoints.length; i++)
    {
        var pointObj = getPointObj(tabPoints[i]);

        if (N > pointObj.lat) N = pointObj.lat;
        else if (S < pointObj.lat) S = pointObj.lat;
        
        if (E > pointObj.lng) E = pointObj.lng;
        else if (W < pointObj.lng) W = pointObj.lng;
    }

    return [[N, W], [S, E]];
}

function centrerVue(tabPoints)
{
    map.flyToBounds(findBounds(tabPoints), {animate:false});
    map.zoomOut();
}

function download()
{
    var txt = lineHeaders + '\n';
    for (var i = 0; i < tabPointsFiltre.length; i++)
        txt += tabPointsFiltre[i].join(';') + '\n';
    downloadFile("extract.csv", txt);
}

function downloadFile(filename, text)
{
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
