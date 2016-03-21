/**
 * util.js, put all the global util functions here.
 */

cbo.util = cbo.util || {};
/**
 * enhance replace
 * @param oString string
 * @param AFindText string
 * @param ARepText string
 * @return string
 */
cbo.util.replaceAll = function (oString, AFindText, ARepText) {
  var raRegExp = new RegExp(AFindText.replace(/([\(\)\[\]\{\}\^\$\+\-\*\?\.\"\'\|\/\\])/g, "\\$1"), "ig");
  return oString.replace(raRegExp, ARepText);
};


/**
 * format number
 * e.g. 12000 => 1,2000
 * e.g. 12000.123 => 1,2000
 * e.g. 12000.123 => 1,2000.123
 * @param amtStr number
 * @return string
 */
cbo.util.formatIntNum = function (amtStr, isPoint) {
  var isInt = function (num) {
    return (num % 1 === 0);
  };
  var amtStr;
  if (!Boolean(isPoint)) {
    amtStr = (isInt(amtStr)) ? amtStr : Number(amtStr).toFixed(0);
  }
  amtStr = "" + amtStr;
  var a, renum = '';
  var j = 0;
  var a1 = '', a2 = '', a3 = '';
  var tes = /^-/;
  var isCurrency = (typeof (isCurrency) != 'undefined') ? isCurrency : true;

  a = amtStr.replace(/,/g, "");
  a = a.replace(/[^-\.,0-9]/g, "");
  a = a.replace(/(^\s*)|(\s*$)/g, "");
  if (tes.test(a))
    a1 = '-';
  else
    a1 = '';
  a = a.replace(/-/g, "");
  if (a != "0" && a.substr(0, 2) != "0.")
    a = a.replace(/^0*/g, "");
  j = a.indexOf('.');
  if (j < 0)
    j = a.length;
  a2 = a.substr(0, j);
  a3 = a.substr(j);
  j = 0;
  for (i = a2.length; i > 3; i = i - 3) {
    renum = "," + a2.substr(i - 3, 3) + renum;
    j++;
  }

  renum = a1 + a2.substr(0, a2.length - j * 3) + renum + a3;

  return renum;
}

/**
 * format number of money.
 * e.g. 12000.235 => 12,000.24
 * @param amtStr number
 * @param count   To several decimal reserved, default 2
 * @param isFormatNum    Whether formatting 12,000 forms default format
 * @return string
 */
cbo.util.formatFloat = function (amtStr, count, isFormatNum) {
  var oCount = count ? count : 2;
  var oNum = Number(amtStr);
  if (oNum == NaN) {
    return 'NaN';
  };
  oNum = oNum.toFixed(oCount);
  if (Boolean(isFormatNum)) {
    oNum = this.formatIntNum(oNum, true);
  };
  return oNum;
}

cbo.util.readLocationConfig = function (locationConfig, locationId) {
  var returnObj,
      breakFlag = false;
  $.each(locationConfig, function (key, value) { 
      if (breakFlag) {
	    return false;
	  }
	  if (key === "food") {
	    $.each(value, function (index, item) {
        returnObj = item.restaurant[locationId];
        if (!!returnObj) {
          breakFlag = true;
          return false;
        }
      });
	  } else {
      returnObj = value[locationId];
      if (!!returnObj) {
        breakFlag = true;
        return false;
      }
    }
  });
	return returnObj;
}

cbo.util.removeElement = function(array, element) { 
  var index = array.indexOf(element);
  array.splice(index, 1);
}