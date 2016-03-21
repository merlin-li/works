/**
 * Model file. Put all the model here.
 */

//cache data
cbo.model = cbo.model || {};

/**
 * Load the location list with related info, such as icon.
 */
cbo.model.locationConfig = function () {
  var oLocationConfig;

  return {
    loadLocationConfig: function (callback) {
      if (!oLocationConfig) {
        $.getJSON(cbo.URL.getLocationConfigURL()).done(function (oResult) {
          oLocationConfig = oResult;
          
          if (callback) {
            callback(oResult);
          }
        });
      }
    },
    getLocationConfig: function () {
      return oLocationConfig;      
    }
  };
}();

/**
 * Get the plan result.
 */
cbo.model.routeList = function () {
  var oRouteList;
  
  function getRouteListURL() {
    var url = cbo.URL.getRouteListURL();
    if (cbo.config.changeRouteList) {
      url = cbo.URL.getRouteListURL() + cbo.config.routeNumber;
      cbo.config.routeNumber++;
    } else if (cbo.config.recalculate) {
      url = cbo.URL.getRecRouteListURL();
    }
    
    return url;
  }
  return {
    loadRouteList: function (json, callback) {
      var url = getRouteListURL();
      $.ajax({
        url: url,
        dataType: 'json',
        data: JSON.stringify(json),
        type: 'POST',
        contentType: "application/json; charset=utf-8"
      }).done(function (oResult) {
        oRouteList = oResult;
        if (callback) {
          callback(oResult);
        }
      });
    },
    getRouteList: function() {
      return oResult;
    }
  };
}();

/**
 * Handle the config
 */
cbo.model.config = function () {
  var oConfigSource;

  return {
    loadConfig: function (callback) {
      if (!oConfigSource) {
        $.getJSON(cbo.URL.getConfigURL()).done(function (oResult) {
          oConfigSource = oResult;
          
          if (callback) {
            callback(oResult);
          }
        });
      }
    },
    getConfig: function (postData) {
      return _.clone(oConfigSource);
    }
  };
}();

/**
 * The location source data
 */
cbo.model.locationList = function () {
  var oLocationList;

  return {
    loadLocationList: function (callback) {
      if (!oLocationList) {
        $.getJSON(cbo.URL.getLocationListURL()).done(function (oResult) {
          oLocationList = oResult;
          
          if (callback) {
            callback(oResult);
          }
        });
      }
    },
    getLocationList: function () {
      return _.clone(oLocationList);
    }
  };
}();

/**
 * The audio text
 */
cbo.model.audioText = function () {
  var oAudioText;

  return {
    loadAudioText: function (callback) {
      if (!oAudioText) {
        $.getJSON(cbo.URL.getAudioTextURL()).done(function (oResult) {
          oAudioText = oResult;
          
          if (callback) {
            callback(oResult);
          }
        });
      }
    },
    getAudioText: function () {
      return _.clone(oAudioText);
    }
  };
}();
