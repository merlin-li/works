/**
 * base.js
 */
 
var cbo = cbo || {};

cbo.enum = {};
cbo.enum.locationType = {
  ENTRANCE_EXIT: 0,
  LOCATION: 1
};

//config
cbo.config = {
  cboMode: 'dev',
  name:'Test',
  templateName: 'route',
  action: 'create',
  iconsPath : 'images/icons/',
  isOffline: function () {
    return cbo.config.cboMode === 'dev';
  },
  recalculate: false,
  changeRouteList: false,
  routeNumber: 3,
  engineeName: "Lois TTS US English"
};

cbo.URL = function () {
  var modes = {
    prod: {
      locationConfig: 'data/locationConfig.json',
      locationList: 'fake_data/locationList.json',
      routeList: 'cbo/app/path/calculate',
      routeList_rec: 'cbo/app/path/calculate',
      config: 'cbo/partner/configuration/get',
      audio: 'data/audio.json'
    },
    dev: {
      locationConfig: 'data/locationConfig.json',
      locationList: 'fake_data/locationList.json',
      routeList: 'fake_data/routeList.json',
      routeList_rec: 'fake_data/routeList2.json',
      config: 'json/config_source.json',
      audio: 'data/audio.json'
    }
  };
  var _modeName = cbo.config.cboMode || 'dev';
  var _mode = modes[_modeName];

  return {
    getLocationListURL: function() {
      return _mode['locationList'];
    },
    getLocationConfigURL: function() {
      return _mode['locationConfig'];
    },
    getRouteListURL: function() {
      return _mode['routeList'];
    },
    getRecRouteListURL: function() {
      return _mode['routeList_rec'];
    },
    getConfigURL: function() {
      return _mode['config'];
    },
    getAudioTextURL: function() {
      return _mode['audio'];
    }
  };
}();

cbo.constraintIcon = {
  outlook: 'meetingIcon',
  food: 'foodIcon',
  show: 'showIcon',
  hotel: 'hotelIcon',
  budget: 'budgetIcon',
  time: 'timeIcon'
};

//constants
cbo.constants = cbo.constants || {};

//cache data
cbo.data = cbo.data || {};
