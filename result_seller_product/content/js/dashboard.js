/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 28.205128205128204, "KoPercent": 71.7948717948718};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.22435897435897437, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "POST Seller - Product"], "isController": false}, {"data": [0.44871794871794873, 500, 1500, "GET Seller - Product"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 78, 56, 71.7948717948718, 802.1923076923077, 0, 2408, 922.5, 1449.1000000000067, 2296.95, 2408.0, 0.01593526197672839, 0.00958745260281053, 0.05364404678786999], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["POST Seller - Product", 39, 38, 97.43589743589743, 1134.7948717948716, 0, 2408, 1018.0, 2295.0, 2389.0, 2408.0, 0.00796802330095183, 0.006863681129207831, 0.05028258454174876], "isController": false}, {"data": ["GET Seller - Product", 39, 18, 46.15384615384615, 469.58974358974365, 0, 1117, 265.0, 1084.0, 1093.0, 1117.0, 0.007969286777441116, 0.0027246755223152294, 0.0033646370281058356], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\apache-jmeter-5.5\\\\bin\\\\deadpool.jpg (The system cannot find the file specified)", 1, 1.7857142857142858, 1.2820512820512822], "isController": false}, {"data": ["Non HTTP response code: java.lang.IllegalStateException/Non HTTP response message: Name is blank", 3, 5.357142857142857, 3.8461538461538463], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\apache-jmeter-5.5\\\\bin\\\\image (The system cannot find the file specified)", 2, 3.5714285714285716, 2.5641025641025643], "isController": false}, {"data": ["400/Bad Request", 6, 10.714285714285714, 7.6923076923076925], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\Challenge (Access is denied)", 4, 7.142857142857143, 5.128205128205129], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\apache-jmeter-5.5\\\\bin (Access is denied)", 1, 1.7857142857142858, 1.2820512820512822], "isController": false}, {"data": ["500/Internal Server Error", 10, 17.857142857142858, 12.820512820512821], "isController": false}, {"data": ["403/Forbidden", 28, 50.0, 35.8974358974359], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 225: https://market-final-project.herokuapp.com/seller/product?access_token=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtvcGF0a29waXRAbWFpbC5jb20iLCJpYXQiOjE2NjE0OTU5ODN9.YQNc3neRVpshWZLfqDpezURE2cusbIs3x7orxOyHedM&amp;name=Ikan buntal&amp;description=buntal buntal&amp;base_price=11111&amp;category_id=1&amp;location=air", 1, 1.7857142857142858, 1.2820512820512822], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 78, 56, "403/Forbidden", 28, "500/Internal Server Error", 10, "400/Bad Request", 6, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\Challenge (Access is denied)", 4, "Non HTTP response code: java.lang.IllegalStateException/Non HTTP response message: Name is blank", 3], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["POST Seller - Product", 39, 38, "403/Forbidden", 11, "500/Internal Server Error", 10, "400/Bad Request", 6, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\CTAS039\\\\Documents\\\\BINAR\\\\Challenge (Access is denied)", 4, "Non HTTP response code: java.lang.IllegalStateException/Non HTTP response message: Name is blank", 3], "isController": false}, {"data": ["GET Seller - Product", 39, 18, "403/Forbidden", 17, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 225: https://market-final-project.herokuapp.com/seller/product?access_token=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtvcGF0a29waXRAbWFpbC5jb20iLCJpYXQiOjE2NjE0OTU5ODN9.YQNc3neRVpshWZLfqDpezURE2cusbIs3x7orxOyHedM&amp;name=Ikan buntal&amp;description=buntal buntal&amp;base_price=11111&amp;category_id=1&amp;location=air", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
