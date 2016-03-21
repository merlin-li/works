//base problem id
rental.data.inputid = -1;

//create the ApplicationHeader control
rental.ui.createHeader();  			
rental.data.pocket = [];
rental.data.flag = false;
//tabs
rental.ui.tabTrip = rental.ui.createTabTrip({
  id: "id_tabs",
  width: "1583px",
  height: "835px"
});
//default
var tab_default = rental.ui.createInputTab(0, 0, {
  id: "id_tab_bJing",
  tooltip: rental.resources.getText("bJingTabTitle"),
  title: rental.resources.getText("bJingTabTitle")
});

rental.ui.tabTrip.addTab(tab_default);
rental.ui.tabTrip.placeAt("tabs");

//get base problem data
$.getJSON(rental.constants.URL_STATIC, function(costmodel) {
  rental.data.costmodel = costmodel;
  rental.depot.loadData(0, (new Date()).getDate(), costmodel);  
  rental.order.showOrderSection(costmodel, 0);
});
$.getJSON(rental.constants.URL_ORDERS, function(costmodel) {
  rental.data.costmodel = costmodel;
  rental.order.showOrderSection(costmodel, 0, 'beijing');
});
$.getJSON(rental.constants.URL_NEWEVENT, function(eventdata){
  rental.data.costmodel = eventdata;
  showNewEvents(eventdata, 0);
  //rental.newevent.showNeweventSection(eventdata, 0);
});


//show movemontstatus

rental.ui.showMovenStatustabConts = function() {	
  jQuery.getJSON(rental.constants.URL_MOVEMENTSTATUS, function(costmodel) {
    var moveTableData = [];
    for (var i in costmodel) {
      moveTableData.push(rental.order.setDataArr(costmodel[i])[2]);
    }
    rental.data.MovenStatabdata = moveTableData;
  var tableVisiblerow = costmodel.length;
   var moveKey = [rental.util.getResourcesText('optid'),
               rental.util.getResourcesText('RepositioningCost'),
               rental.util.getResourcesText('NumberRepositionings'),
               rental.util.getResourcesText('NumberUpgrades'),
               rental.util.getResourcesText('Utilisation'),
               rental.util.getResourcesText('RepositioningDistance'),
               rental.util.getResourcesText('UpgradeCost'), 
               rental.util.getResourcesText('NumberBorrowed'), 
               rental.util.getResourcesText('TotalCost'),
               rental.util.getResourcesText('NumberOrders')
              ],
    moveVal = ['optid', 'RepositioningCost', 'NumberRepositionings', 'NumberUpgrades', 'Utilisation', 'RepositioningDistance', 'UpgradeCost', 'NumberBorrowed', 'TotalCost', 'NumberOrders'];
    rental.ui.tabs[0]['mstatsTab'].removeAllContent();    
    rental.showMovenStatusTab = rental.order.createNewOdtable(rental.util.getResourcesText("tabAnalysis"), moveKey, moveVal, rental.data.pocket, 'text', 0, 'mstatsTab'); 
    
    var oButtonWhatIf = new sap.ui.commons.Button({
            width: '70px',
            height: '30px',
            text : "what-if",
            style:sap.ui.commons.ButtonStyle.Emph
    }); 
    oButtonWhatIf.addStyleClass("whatifButton");    
    rental.ui.tabs[0]["mstatsTab"].addContent(oButtonWhatIf);   
    oButtonWhatIf.attachPress(function() {
    
       if(rental.data.flag) {
          createPopupContent();
        } else { 
          return 
        }
      }); 
    var vRowCount;
		if (tableVisiblerow = 0) {
			vRowCount = 0;
		} else if (costmodel.length > 5) {
			vRowCount = 5;
		} else {
      vRowCount = costmodel.length;
    }
    rental.showMovenStatusTab.setVisibleRowCount(vRowCount);  
    //console.log(rental.data.flag);
    rental.showMovenStatusTab.attachRowSelect(function(oControlEvent) {   
        if(this.getSelectedIndex() >= 0) { 
          rental.data.flag = true;
        } else {
          rental.data.flag = false;
        }
        var _cslect = this.getSelectedIndices();
        var _getContents = rental.ui.tabs[0]["mstatsTab"].getContent();
        for (var i = 0; i < _getContents.length; i++) {
          if ((i != 0) && (i != 1) ) {
            rental.ui.tabs[0]["mstatsTab"].removeContent(i);  
          }       
        }
        for (var j = 0; j < _cslect.length; j++) {
          rental.ui.tabs[0]["mstatsTab"].addContent(drawMmentChart(_cslect[j])); 
        }
    });
    //console.log(rental.data.flag);
    //draw the piechart
    function drawthePiechart(_sindex) {
      var charttype = "piechart",
      _carchartid = "movement_fleetChart"+_sindex,
      _carchartdata = [['FleetUtilization','FleetUtilization value'],
                       [rental.util.getResourcesText('Assignments'), dealVal(costmodel[_sindex].FleetUtilization.Assignments)],
                       [rental.util.getResourcesText('Repositioning'), dealVal(costmodel[_sindex].FleetUtilization.Repositioning)],
                       [rental.util.getResourcesText('Substitutions'), dealVal(costmodel[_sindex].FleetUtilization.Substitutions)]
                      ],
      _title = rental.util.getResourcesText('FleetUtilization'),
     options = {title: _title, width:'400', height:'300', backgroundColor:'#F2F2F2'};
      if (_carchartdata.length > 0) {
        rental.util.drawChart(charttype, _carchartid, _carchartdata, options);       
      } else {
        //console.log("data error");
      }
    }
    function drawtheCloumnChart(_sindex) {
      var charttype = "columnchart",
      _carchartid = "movement_costChart"+_sindex,
      _carchartdata = [['', rental.util.getResourcesText('SAPRepos'), rental.util.getResourcesText('ShenzhouRepos'), rental.util.getResourcesText('SAPSubst'), rental.util.getResourcesText('ShenzhouSubst')],
                       ['', costmodel[_sindex].Costs.SAPRepos, costmodel[_sindex].Costs.ShenzhouRepos, costmodel[_sindex].Costs.SAPSubst, costmodel[_sindex].Costs.ShenzhouSubst]
                      ],
      _title = rental.util.getResourcesText('chartcost');
      var options = {title: _title, width:'600', height: '300', backgroundColor: '#F2F2F2', colors:['#2167CC', 'green']};
      if (_carchartdata.length > 0) {
        rental.util.drawChart(charttype, _carchartid, _carchartdata, options);       
      } else {
        //console.log("data error");
      }        
    
    }
    
   function drawMmentChart(_sindex) {
      var movementChartLayout = new sap.ui.commons.layout.MatrixLayout({
        width: '100%',
        columns: 2,
        layoutFixed: false
      }); 
 
      var movementPieCell = new sap.ui.commons.layout.MatrixLayoutCell();
      var fleetChartHtml = new sap.ui.core.HTML({
        content: '<div id= movement_fleetChart'+_sindex+'></div>',
        afterRendering : function(e) {
          drawthePiechart(_sindex);
        }
      });
      movementPieCell.addContent(fleetChartHtml);
    
      var movementColumn = new sap.ui.commons.layout.MatrixLayoutCell();
      var costChartHtml = new sap.ui.core.HTML({
        content: '<div id= movement_costChart'+_sindex+'></div>',
         afterRendering : function(e) {
          drawtheCloumnChart(_sindex);
        }
      });
      movementColumn.addContent(costChartHtml);
      movementChartLayout.createRow(movementPieCell, movementColumn);
      
      return movementChartLayout;
    }

  });		
  

}
rental.ui.showMovenStatustabConts();




        
function showNewEvents(data, index) {
  //component table
    var componentTable = new sap.ui.table.DataTable();
    var vRowCount;
		if (data.length < 15) {
			vRowCount = data.length;
		} else {
			vRowCount = 15;
		}
    componentTable.setVisibleRowCount(vRowCount);
    
    var textview_Component = new sap.ui.commons.TextView().bindProperty("text", "eventID");
    componentTable.addColumn(new sap.ui.table.Column({label: rental.util.getResourcesText("ID"), template: textview_Component}));
    textview_Component = new sap.ui.commons.TextView().bindProperty("text", "eventType");
    componentTable.addColumn(new sap.ui.table.Column({label: rental.util.getResourcesText("eventlabelType"), template: textview_Component}));
    textview_Component = new sap.ui.commons.TextView().bindProperty("text", "priority");
    componentTable.addColumn(new sap.ui.table.Column({label: rental.util.getResourcesText("accordionnewProperty"), template: textview_Component}));

    var json_Component = new sap.ui.model.json.JSONModel();
    json_Component.setData({modelData: data});
    componentTable.setModel(json_Component);
    componentTable.bindRows("/modelData");
    rental.ui.tabs[index]["newEventSection"].addContent(componentTable);
}
// deal the dataVal ,if dataVal < 1 it doesn't work in pie chart;
function dealVal(val){
  var num = val;
  if (val < 1) {
    return num = num * 100;
  } else {
    return num;
  }
}

function createPopupContent() {
  jQuery.getJSON(rental.constants.URL_COSTVALUE, function(costmodel) {
    //var popupdata = rental.data.costmodel;
    var oDialog1 = new sap.ui.commons.Dialog({title: 'Cost Analysis',width: '620px'});
    var popUpLayout = new sap.ui.commons.layout.MatrixLayout({
        columns : 3,
        width: '590px',
          layoutFixed: false
    }); 
    var _whatLabel = new sap.ui.commons.Label({text: "Buying Cost:", width: '120px'}); 
    var _whatInputone = new sap.ui.commons.TextField({width: '120px', value:costmodel.BuyCost});
    var _whatTextViewone = new sap.ui.commons.TextView({text: "RMB"});
    var _whatLabeltwo = new sap.ui.commons.Label({text: "Repositioning Cost:", width: '120px'}); 
    var _whatInputtwo = new sap.ui.commons.TextField({width: '120px',value: costmodel.RepositioningCost});
    var _whatTextViewtwo = new sap.ui.commons.TextView({text: "RMB/km"});
    var oLayout = new sap.ui.commons.layout.HorizontalLayout({
              content: [_whatLabel, _whatInputone, _whatTextViewone]
    });
    _whatInputtwo.addStyleClass('textArea');
    _whatInputone.addStyleClass('textArea');
    var oLayout2 = new sap.ui.commons.layout.HorizontalLayout({
      content: [_whatLabeltwo, _whatInputtwo, _whatTextViewtwo]
    });
    var newObj = new sap.ui.table.Table({
      title: 'Substitutions Cost:',			
      visibleRowCount: 5,
      selectionMode: sap.ui.table.SelectionMode.None		 
      });
      newObj.addColumn(new sap.ui.table.Column({
        label: new sap.ui.commons.Label({text: 'FromCarType'}),
        template: new sap.ui.commons.TextView().bindProperty('text', 'FromCarType')
      }));	
      newObj.addColumn(new sap.ui.table.Column({
        label: new sap.ui.commons.Label({text: 'ToCarType'}),
        template: new sap.ui.commons.TextView().bindProperty('text', 'ToCarType')
      }));	
      
      newObj.addColumn(new sap.ui.table.Column({
        label: new sap.ui.commons.Label({text: 'Cost'}),
        template: new sap.ui.commons.TextField().bindProperty('value', 'Cost')
      }));	 
      
    var ordersModel = new sap.ui.model.json.JSONModel();
      ordersModel.setData({modelData: costmodel.SubstitutionCosts});
      newObj.setModel(ordersModel);
      newObj.bindRows("/modelData");
    
    var oButtonRun = new sap.ui.commons.Button({
         text: 'RUN',
         width: '60px'

        });
     // var btnflag = -1;
      oButtonRun.attachPress(function() {
        //btnflag = btnflag + 1;
        if (rental.data.pocket.length < 5) {
          rental.data.pocket.push(rental.data.MovenStatabdata[rental.data.pocket.length]);   
          	var ordersModel = new sap.ui.model.json.JSONModel();
            ordersModel.setData({modelData: rental.data.pocket});
             rental.showMovenStatusTab.setModel(ordersModel);
             rental.showMovenStatusTab.bindRows("/modelData");
        }

      })

    oButtonRun.addStyleClass('addRunStyle');
    popUpLayout.createRow(oLayout);
    popUpLayout.createRow(oLayout2);
    popUpLayout.createRow(newObj);
    popUpLayout.createRow(oButtonRun);
    
    oDialog1.addContent(popUpLayout);
    oDialog1.open();
  }); 
}


/*
         press : function() {
         $("#__table2-row1").show();
            }
            */