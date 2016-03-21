rental.order = (function() {
/**
 * Create table.
 * @param title: the table title.
 * @param dataProperty: the columntitle array .
 * @param dataKey: data json property.
 * @param dataArr: data json.
 * @param tbtype: tabletype.
 * @param tablehandle: container.
 * @return {newObj} the table object.
 */
	function createNewOdtable(title, dataProperty, dataKey, dataArr, tbtype, index, tablehandle) {
		var vRowCount;
		if (dataArr.length < 15) {
			vRowCount = dataArr.length;
		} else {
			vRowCount = 15;
		}
		var newObj = new sap.ui.table.DataTable({
			title: title,			
      visibleRowCount: vRowCount
			//selectionMode: sap.ui.table.SelectionMode.Single		 
			});	 
			
		for (var i = 0; i < dataProperty.length; i++) {
			newObj.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text: dataProperty[i]}),
				template: new sap.ui.commons.TextView().bindProperty(tbtype, dataKey[i])
				//sortProperty: dataProperty[i],
			}));		
		}
		
		var ordersModel = new sap.ui.model.json.JSONModel();
			ordersModel.setData({modelData: dataArr});
			newObj.setModel(ordersModel);
			newObj.bindRows("/modelData");
			rental.ui.tabs[index][tablehandle].addContent(newObj);	
		return newObj;
	}	
	/**
 * Create table.
 * @param jsonpath: the data path.
 * @return dataarr the data array.
 */
// set json data to arry
	function setDataArr(jsonpath) {
	  var dataarr = [];
    for (var Key in jsonpath) {
      dataarr.push(jsonpath[Key]);
    }	
		return dataarr;
	}
//json

	
  return {
    'showOrderSection': function(orders, index, flag) {
      //show BeiJing order
      var flag;
      var beiJdataArr = setDataArr(orders.orders);
      if (beiJdataArr.length > 0 && flag === 'beijing') {		
        var beijOrderTable = createNewOdtable(rental.util.getResourcesText("accordionOrder"), [rental.util.getResourcesText('accordCustomerId'), rental.util.getResourcesText('accordStartdate'), rental.util.getResourcesText('accordReturndate'), rental.util.getResourcesText('accordReturnlocation'), rental.util.getResourcesText('accordPickuplocation')],['id', 'startdate', 'returndate', 'returnlocation', 'pickuplocation'], beiJdataArr, 'text', index, 'orderSection');
      }   

      },
      'setDataArr': setDataArr,
      'createNewOdtable': createNewOdtable
    }					
})(); 
