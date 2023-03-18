function DessinerPoints(tab)
{
    for (var i = 0; i < layersPoints.length; i++) layersPoints[i].remove();
    layersPoints = [];

    for (var i = 0; i < tab.length; i++)
        layersPoints.push(L.circle([tab[i].lat, tab[i].lng], {radius: 100, fill: true}).addTo(map));
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
        divOut.value += tabPoints[i].lat + ";" + tabPoints[i].lng + "\n";
}

function appliquerFiltre()
{
    tabPointsFiltre = filtrer(tabPointsImport);
    ecrireDiv('pointsOut', tabPointsFiltre);
}

function filtrer(tabPoints)
{
    var tabPolygons = map.pm.getGeomanDrawLayers();
    var tabFiltre = [];

    for (var i = 0; i < tabPoints.length; i++)
    {
        var flagAdded = false;

        for (var j = 0; j < tabPolygons.length && !flagAdded; j++)
        {
            if ("_mRadius" in tabPolygons[j])
            {
                if (IsInsideCircle(tabPoints[i], tabPolygons[j]._latlng, tabPolygons[j]._mRadius))
                {
                    tabFiltre.push(tabPoints[i])
                    flagAdded = true;
                }
            }
            else
            {
                if (IsInsidePolygon(tabPoints[i], tabPolygons[j]._latlngs[0]))
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
    ecrireDiv('pointsIn', tabPointsImport);
    DessinerPoints(tabPointsImport);
  }
  
  fileReader.readAsText(fileInput.files[0]);
}


function importCSV(txt)
{
  var lines = txt.split('\n');
  var data = [];

  for (var i = 0; i < lines.length; i++)
  {
    var tab = lines[i].trim().split(';');
    var lat = parseFloat(tab[0]);
    var lng = parseFloat(tab[1]);
        
    if (!isNaN(lat) && !isNaN(lng))
        data.push({lat:lat, lng:lng});
  }

  return data;
}
