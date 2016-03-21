/**
 * controller.js
 */

cbo.controller = cbo.controller || {};

/**
 * the entry of the project
 */
cbo.controller.mainModule = function () {
  return {
    /**
     * Inits all the modules. It will invoke all the init method in the modules
     */
    initModules: function () {
      _.each(cbo.controller, function (controller, name) {
        if (controller.init) {
          controller.init();
        }
      });
    }
  };
}();

/**
 * Whole layout.
 */
cbo.controller.layout = function($) {
  function adjustConentWidth() {
    var pageWidth = $(document).width(),
        contentWidth = (pageWidth - 1256) / 2 + 1256;
    //ajust the 
    $('#content').width(contentWidth);
  }
  
  function _createOverlay(element) {
    $(element).children('.overlay').remove();
    $('<div class="overlay"></div>').appendTo(element).animate({opacity: 0.3}, 1000)
  }
  
  function _removeOverlay(element) {
    $(element).find('.overlay').remove();
  }
  return {
    init: function() {
      $('#plan-result header').hide();
      adjustConentWidth();
    },
    flipToMap: function() {
      //2560 is the width of two pages
      var marginLeft = $('#content').width() - $('#page-list').width();
      
      _removeOverlay('#plan-result');
      $('#content').css('float', 'left');
      $('#parameter').find('.parameter-main').removeClass('parameter-main');
      $('#plan-result').find('.main').addClass('plan-result-main');
      $('#page-list').animate({
        marginLeft: marginLeft
      }, 2000, function(){
        var audio;
        _createOverlay('#parameter');
        if (cbo.config.recalculate) {
          audio = 'reCalculateResult';
        } else {
          audio = 'result';
        }
        cbo.controller.audioText.playAudioByKey(audio, function() {
          cbo.controller.map.renderPath();
        });
      });
    },
    flipToParameter: function() {
      _removeOverlay('#parameter');
      $('#content').css('float', 'right');
      $('#plan-result').find('.plan-result-main').removeClass('plan-result-main');
      $('#parameter').find('.main').addClass('parameter-main');
      $('#page-list').animate({
        marginLeft: 0
      }, 2000, function(){
        _createOverlay('#plan-result');
        cbo.controller.map.stopAnimation();
      });
    },
    showLoadingIcon: function() {
      $('<div class="overlay"></div>').appendTo('body').animate({opacity: 0.3}, 1000);
      $('<img class="loading" style="display: none" src="images/loading.gif" />').appendTo('body').show(1000);
    },
    removeLoadingIcon: function() {
      $('.overlay').hide(1000).remove();
      $('.loading').hide(1000).remove();
    }
  };
}(jQuery);

/**
 * Book cover controller
 */
cbo.controller.cover = function() {
  var $pageList;
  
  //Function of fliping the book
  function turnPage() {
    $pageList.turn({
      duration: 3000,
      elevation: 200
    });
    
    $pageList.bind('turned', function() {
      $(this).animate({
        marginLeft: 0
      }, 2000, function() {
        $('#content').css('overflow', 'hidden');;
        $('<div class="overlay"></div>').appendTo('#plan-result').animate({opacity: 0.3}, 1000);
        cbo.controller.audioText.playAudioByKey('constraint');
      });
    });
    
    $('#login-id').click(function() {
      //map page was hidden at the begin to fix a bug with trick way.
      $('#plan-result header').show();
      $('#parameter').find('.main').addClass('parameter-main');
      $pageList.turn('page', 2);
    });
  }
  
  var abc;
  //var i = 0;
  function show() {
    var current = abc.shift();
    var step = 1;
    if (current) {
      if (current[1] - current[0] > 0) {
        step = 1;
      } else {
        step = -1;
      }
      rotate(current, step);
    } 
    // else {
      // i++;
      // if (i > 1) {
        // return;
      // }
      // abc = [[0, 99], [99, 70], [70, 99], [99, 70], [70, 99], [99, 0]];
      // setTimeout(show, 2400);
    // }
  }
  
  function rotate(interval, step) {
    var $arm = $('#arm');
    var start = interval[0];
    var end = 0;
    var intervalId = setInterval(function() {
      end = 0 - start;
      $arm.css('-webkit-transform','rotate('+end+'deg)');
      start += step;
      if (start === interval[1]) {
        clearInterval(intervalId);
        show();
      }
    }, 4);
  
  }
  return {
    init: function() {
      $pageList = $('#page-list');
      turnPage();
    },
    showPeopleAnimation: function() {
      abc = [[0, 85], [85, 60], [60, 85], [85, 60], [60, 85], [85, 0]];
      show();
    }
  };
}();

/**
 * Parameter for calculating plan
 */
cbo.controller.parameter = function() {
  var locationList, locationConfig;
  var callbacks = jQuery.Callbacks();
  var constraintObjects = {};
  var constraintObjectsKey = [];
  var constraintsCost = {};
  var softConstraintCost = {};
  var locationListObjects = {};
  var monthData = {
     '1': "Mon", '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun',
     '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };
  
  var inputParameter = {
    "name": "Test",
    "template": "route",
    "entrance": 0,
    "exit": 0,
    "mandate": [1, 2, 3],
    "unMandate": [1,2],
    "softLocation": {
      "7": 1.2,
      "8": 1.8,
      "9": 2.0
    },
    "parameter": {
      "TimeMin": 0,
      "TimeMax": 1440,
      "MoneyMax": 10000,
      "AvailableStart": 0,
      "AvailableEnd": 0,
      "Budget": 0,
      "PopularityWeight": 0,
      "OvertimeWeight": 0,
      "OverspendWeight": 0,
      "IsHardTimelimit": 0,
      "IsHardBudget": 0,
      "TimeWeight": 0,
      "CostWeight": 0,
      "NumberVisits": 0,
      "NeedBreakfast": 0,
      "NeedLunch": 1,
      "NeedSupper": 1
    }
  };
  //backup for the future useage.
  var emptyInputParameter = $.extend(true, {}, inputParameter);
  
  //Calculation sub module for getting the result
  var calculation = function() {
    var mandateLength, softLength,
        result;
    
    //calculate the plan
    function calculatePlan() {
      //TODO: only get fake data now, waiting for the new requirement
      cbo.model.routeList.loadRouteList(inputParameter, function(routeList) {
        result = routeList;
        if (cbo.config.isOffline()) {
          setTimeout(function() {
            showResult();
          }, 2000);
        } else {
          showResult();
        }
      });
    }
    
    
    function showResult() {
      var finalRoute;
      
      cbo.controller.layout.removeLoadingIcon();
      
      result.totalCost = inputParameter.parameter.Budget;
      callbacks.fire(result);
      cbo.controller.layout.flipToMap();
    }
    
    return {
      /**
       * Calculate the routeList based on the user input
       */
      calculate: function() {
        mandateLength = inputParameter.mandate.length;
        softLength = _.size(inputParameter.softLocation);
        results = [];
        //TODO: show loading icon
        
        calculatePlan(mandateLength);
        
      }
    };
  }();
  
  var spot = function () {
    var map,
        isInitial = true,
        markerTags = {},
	      markers = {},
        mandate = [],
        markerTagStyle;
        
    markerTagStyle = {
      'position': 'absolute', 
      'top': '-38px', 
      'left': '38px', 
      'width': '31px',
      'height': '33px', 
      'background': 'url("./css/images/icon_location.png") no-repeat -50px'
    };
        
    function _initMap(canvas) {
      var overviewStyles = [
          {
            elementType: 'all',
            featureType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            elementType: 'all',
            featureType: 'landscape',
            stylers: [{ visibility: 'on'}]
          },
          {
            elementType: 'geometry',
            featureType: 'road',
            stylers: [{ visibility: 'on' }]
          },   
          {
            elementType: 'geometry',
            featureType: 'road.arterial',
            stylers: [{ color: '#FFFFFF' }, {lightness: -2}]
          },
          {
            elementType: 'geometry',
            featureType: 'road.highway',
            stylers: [{ visibility: 'off' }]
          },
          {
            elementType: 'geometry',
            featureType: 'road.local',
            stylers: [{ color: '#E2E0DB' }]
          },
          {
            elementType: 'labels',
            featureType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ visibility: 'on' },{ "color": "#8EBACA" }]
          },
          {
           "featureType": "water",
           "elementType": "labels.text.fill",
           "stylers": [{ visibility: 'on' }, { "color": "#F4F3F2" }]
          }
        ];

      var mapoptions = {
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        minZoom: 12,
        maxZoom: 16,
        center: new google.maps.LatLng(31.236252, 121.501919),
        streetViewControl: false,
        mapTypeControl: false,
        panControl: false,
        rotateControl: false,
        zoomControl: false,
        overviewMapControl: false,
        styles: overviewStyles,
        disableDefaultUI: true,
      };
      
      map = new google.maps.Map(canvas, mapoptions);
      
      google.maps.event.addDomListener(document.getElementById('spot-nav'), 'click', function() {
        google.maps.event.trigger(map, 'resize');
      });
    }
    
    function initMarkers() {
      var allLocations = cbo.controller.map.getAllLocations();
      var marker;
      _.each(locationConfig.spot, function(value, key) {
        marker = createMarker(allLocations[key]);
        markers[key] = marker;
        google.maps.event.addListener(marker, 'click', function (event) {
          clickMarker(key);
        });
      });
    }
    
    function initMarkerTags() {
      var markerTag,
          div,
          contentWrapper,
          img;
          
      _.each(markers, function(marker, key) {
        div = document.createElement('DIV');
        contentWrapper = document.createElement('DIV');
        contentWrapper.appendChild(div);
        $(contentWrapper).css({'position': 'relative'});
        $(div).css(markerTagStyle);
        markerTag = new RichMarker({
          map: null,
          position: marker.getPosition(),
          content: contentWrapper,
          anchor: RichMarkerPosition.BOTTOM_LEFT,
          zIndex: 2
        });
        markerTags[key] = markerTag;
      });
    }
    
    function showOverView() {
      var bounds = new google.maps.LatLngBounds();
      _.each(markers, function (marker, key) {
        markerPosition = marker.getPosition();
        //console.log(markerPosition);
        bounds.extend(markerPosition);
      });
      
      map.fitBounds (bounds);
    }
    
    function clickMarker(markerId) {
      if (markers[markerId].get('clickable') === 'false') {
        return;
      }
      if (!!markerTags[markerId].getMap()) {
        delMarkerTag(markerId);
      } else {
        _addMarkerTag(markerId);
      };
    }

    //Get point data from temp cache object, then render map and mark the point
    function _addMarkerTag(markerId) {
      mandate.push(markerId);
      markerTags[markerId].setMap(map);
    };
    
    function delMarkerTag(markerId) {
      markerTags[markerId].setMap(null);
      cbo.util.removeElement(mandate, markerId);
    }

    function createMarker(location) {
      var div = document.createElement('DIV');
      var img = document.createElement('IMG');
      img.src = location.icon;
      div.appendChild(img);
      $(div).css({'width': '120px'});
      var locationMarker = new RichMarker({
        map: map,
        position: location.latlng,
        content: div,
        anchor: RichMarkerPosition.BOTTOM_LEFT,
        zIndex: 1
      });
     
      locationMarker.set('clickable', 'true');
      return locationMarker;
    }
    
    function disableMarker(marker) {
      marker.set('clickable', 'false');
      var $img = $(marker.getContent()).find('img');
      $img.css({
        'opacity': 0.5
      });
    }
    
    return {
      renderMap: function() {
        if (isInitial) {
          var qtip_content = document.getElementById('qtip-spot');
         // google.maps.event.addDomListener(qtip_content, 'click', function() { 
           map.setCenter(new google.maps.LatLng(31.236252, 121.501919));         
           initMarkers();
           initMarkerTags();
           //showOverView();
          //});
        }
        isInitial = false;
      },
      
      restoreMap: function() {
        map.setCenter(new google.maps.LatLng(31.236252, 121.501919)); 
        map.setZoom(14);
      },
      
      initMap: function (canvas) {
        _initMap(canvas)
      },
      
      resizeMap: function () {
        google.maps.event.trigger(map, 'resize');
      },
      
      getCheckedSpots: function () {
        console.log(mandate);
        return mandate;
      },
      
      disableCheckedSpots: function (checkedSpotIds) {
        var marker;
        _.each(checkedSpotIds, function(mandateId) {
          markerTags[mandateId].setMap(null);
          marker = markers[mandateId];
          disableMarker(marker);
        });
        mandate = [];
      },
      
      enableMarker: function(markerId) {
        var marker = markers[markerId],
            $img = $(marker.getContent()).find("IMG");
        marker.set("clickable", "true");
        $img.css({'opacity': 1});
      }
    }
  }();
  
  //All of the operation of the constraints
  var operateOnConstraints = function() {
    var $parameter = $('#parameter'),
        $hardParameters = $('#hard-parameters'),
        $softParameters = $('#soft-parameters');
        
    //Initial the hard constraint parameters
    function _initHardParameter(constraintObjects, constraintObjectsKey) {
      var constraintObjKeydata = constraintObjectsKey,
          $softParameterLis = $softParameters.find('li');
      
      _.each($softParameterLis, function(softParameterLi) {
        var softParameterLiId = $(softParameterLi).data('id');
        
        constraintObjKeydata = _.without(constraintObjKeydata, softParameterLiId.toString());
      });
      
      var $hardParametersTemplate = _.template(cbo.view.hardConstraintTemplate, {hardParameters : constraintObjects, hardParametersId : constraintObjKeydata});
      $hardParameters.html($hardParametersTemplate);
      _setParameterUnselect(constraintObjects);
      
      _.each($hardParameters.find('li'), function(hardParameterLi) {
        var $hardParameterLi = $(hardParameterLi),
          $spotSpan = $hardParameterLi.find('.spot'),
          hardParameterWillData = $hardParameterLi.attr('data-will');
        
        if($spotSpan.length > 0 && hardParameterWillData === 'yes'){
          var bgImgUrl = $spotSpan.data('url');
          $spotSpan.css('background', 'url(./images/icons/slicesofspot/' + bgImgUrl + ') no-repeat')
                   .css('background-position', '25% 50%')
                   .css('background-size', '100%');
        } else if($spotSpan.length > 0 && hardParameterWillData === 'no') {
          var willNoBgImgUrl = $spotSpan.data('url').split('.');
          var willNoBgImgUrlStr = willNoBgImgUrl[0] + '-1.png';
          $spotSpan.css('background', 'url(./images/icons/slicesofspot/' + willNoBgImgUrlStr + ') no-repeat')
                   .css('background-position', '25% 50%')
                   .css('background-size', '100%');
        }
      });
      
      _addCloseIconToLi($hardParameters);
      _deleteParameter($hardParameters);
      _handleWillNotGoToSpots($hardParameters);
    }
    
    //Initial the soft constraint parameters
    function _initSoftParameter() {
      $softParameters.html(cbo.view.softConstraintTemplate);
      _addCloseIconToLi($softParameters);
      _deleteParameter($softParameters);
    }
    
    function _addCloseIconToLi(parameter) {
      parameter.on('mouseover', '.liParam', function() {
        $(this).find('.liDiv').addClass('liHover');
        $(this).find('.icon-img').addClass('icon-close');
      });
      parameter.on('mouseout', '.liParam', function() {
        $(this).find('.liDiv').removeClass('liHover');
        $(this).find('.icon-img').removeClass('icon-close');
      });
    }
    
    //Listening drag function
    function _initConstraintDraggable() {
      var $constraints = $parameter.find('.constraint');
      
      _.each($constraints, function(constraint) {
        $(constraint).on('mousedown', 'li', function() {
          if (false === $(this).hasClass('liEnabled')) {
            _dragConstraintElement(this);
          }
        });
      });
    }
    
    function _dragConstraintElement(constraintElem) {
      constraintElem.ondragstart = function(e) {
        var $target = $(e.target);
        var targetLength = $target.parent('li').length;
        var dragTargetId = $(this).closest('article').attr('id');
        var currentTargetIdValue = $(this).data('id');
        var willNotGoSpotId = $(this).data('will');
        
        //Keep the same structure for <li> in hard constraint and soft constraint
        if($(this).find('.soft-constraint-value').length === 1) {
          $(this).find('.soft-constraint-value').remove();
        }
        
        //Judge current dragging paramater is li or li's children
        if(targetLength === 1) {
          $target.parent('li').addClass('dragged');
        } else {
          $target.addClass('dragged');
        }
        
        e.dataTransfer.setData('expression', this.innerHTML);
        e.dataTransfer.setData('dragTargetId', dragTargetId);
        e.dataTransfer.setData('currentTargetIdValue', currentTargetIdValue);
        e.dataTransfer.setData('willNotGoSpotId', willNotGoSpotId);
      };
    }
    
    //Listening drop function
    function _initConstraintDroppable() {
      var $articlesToDrop = $parameter.find('.constraint');
      
      _.each($articlesToDrop, function(articleToDrop) {
        _dropConstraintElement(this);
      });
    }
    
    function _dropConstraintElement(constraintElem) {
      constraintElem.ondrop = function(e) {
        var data = e.dataTransfer.getData('expression'),
            dragTargetIdData = e.dataTransfer.getData('dragTargetId'),
            currentTargetIdData = e.dataTransfer.getData('currentTargetIdValue'),
            willNotGoSpotIdData = e.dataTransfer.getData('willNotGoSpotId'),
            targetClass = $(e.target).attr('class'),
            isHardConstraint = $(e.target).closest('#hard-constraint').length,
            isSoftConstraint = $(e.target).closest('#soft-constraint').length,
            constraintDataStr,
            $target;
        
        if(!!willNotGoSpotIdData) {
          constraintDataStr = '<li draggable="true" class="liParam" data-will=' + willNotGoSpotIdData + ' data-id=' + currentTargetIdData + '>' + data + '</li>';
        }
        
        //Determine drop object, only two section: hard constraint or soft constraint
        if(targetClass === 'constraint') {
          $target = $(e.target);
        } else if(isHardConstraint === 1) {
          $target = $(e.target).closest('#hard-constraint');
        } else if(isSoftConstraint === 1) {
          $target = $(e.target).closest('#soft-constraint');
        } else {
          $target = $parameter.find('#' + dragTargetIdData + '');
        }
        
        $parameter.find('.dragged').remove();
        $target.find('ul').append(constraintDataStr);
        
        _.each($target.find('li'), function(liDom) {
          $liDom = $(liDom);
          $liDom.find('div').removeClass('liHover');
          if($liDom.find('.icon-close').length > 0) {
            $liDom.find('.icon-close').removeClass('icon-close');
          }
        });
        
        if($target.attr('id') === 'soft-constraint') {
          var $aStr = $('<a class="param-weight-value"></a>');
          var $spanStr = $('<span class="soft-constraint-value"></span>');
          
          $target.find('li').last().append($aStr);
          $target.find('li').last().append($spanStr);
          _addSoftConstraintSlideStyle($spanStr);
        } else if($target.attr('id') === 'hard-constraint') {
          _handleWillNotGoToSpots($hardParameters);
          getCostValueAfterSliding(currentTargetIdData, false);
        }
        
        e.preventDefault();
      };
      
      constraintElem.ondragover = function(e) {
        e.preventDefault();
      };
    }
    
    function _addSoftConstraintSlideStyle(spanStr) {
      var liWeightValue;
      var $paramSpan = $(spanStr);
      var liIdValue = $paramSpan.closest('li').data('id');
      
      $paramSpan.slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: 50,
        create: function(event, ui) {
          $(this).find('a').html('<span>50%</span>');
          _handleWillNotGoToSpots($softParameters);
          getCostValueAfterSliding(liIdValue, true, 50);
        },
        slide: function(event, ui) {
          $(this).attr('data-weight', ui.value);
          $(this).siblings('a').removeClass('icon-close');
          $(this).find('a').html('<span>' + ui.value + '%</span>');
          liIdValue = $(this).parent('li').data('id');
          liWeightValue = $(this).data('weight');
          softConstraintCost[liIdValue] = ui.value;
        },
        stop: function(event, ui) {
          $(this).siblings('a').addClass('icon-close');
          getCostValueAfterSliding(liIdValue, true, ui.value);
        }
      });
    }
    
    function getCostValueAfterSliding(liIdValue, isSoftConstraint, sildeValue) {
      var costValue = 0;
      var hasObjectKey = _.has(constraintsCost, liIdValue);
      
      if(hasObjectKey) {
        if(isSoftConstraint) {
          constraintsCost[liIdValue] = parseInt((locationListObjects[liIdValue] * sildeValue) / 100);
        } else {
          constraintsCost[liIdValue] = parseInt((locationListObjects[liIdValue]));
        }
      }
      _.each(constraintsCost, function(constraintCost, key) {
        costValue = costValue + parseInt(constraintCost);
      });
      
      if(costValue !== 0) {
        $('#cost-value').show();
      }
      
      costValue = parseInt(costValue * 1.5);
      
      $('#cost-value').find('#cost-value-span').html(costValue);
      $('#cost-progress-bar').progressbar('option', 'value', costValue);
      $('#cost-value').fadeOut(1000);
    }
    
    //Delete constraint parameter
    function _deleteParameter(parameter) {
      parameter.off('click').on('click', '.icon-close', function(event) {
        var $currentLi = $(this).parent('li');
        var constraintName = $currentLi.data('id');
        var costValue = 0;
        
        if (constraintObjects[constraintName] !== undefined) {
          _showNodeByTheDeletedConstraint(constraintName, constraintObjects[constraintName].type);
        }
        
        delete constraintObjects[constraintName];
        delete constraintsCost[constraintName];
        
        if(!!softConstraintCost[constraintName]) {
          delete softConstraintCost[constraintName];
        }
        _.each(constraintsCost, function(constraintCost, key) {
          costValue = costValue + parseInt(constraintCost);
        });
        
        if(costValue === 0) {
          toggleCostValueProgressBar(false);
        } else {
          $('#cost-value').show();
          if(constraintName === 'budget') {
            toggleCostValueProgressBar(false);
          }
        }
        
        costValue = parseInt(costValue * 1.5);
        
        $('#cost-value').find('#cost-value-span').html(costValue);
        $('#cost-progress-bar').progressbar('option', 'value', costValue);
        $('#cost-value').fadeOut(1000);
        
        constraintObjectsKey = _.without(constraintObjectsKey, constraintName.toString());
        
        _setParameterUnselect(constraintObjects);
        $currentLi.remove();
        return false;
      });
    }
    
    function _moveConstraintAutomatically(parameterIds) {
      var $constraints = $('#parameter').find('.constraint');
      _.each($constraints, function(constraint) {
        var $lis = $(constraint).find('li');
        
        _.each($lis, function(liConstraint) {
          var liData = $(liConstraint).data('id');
          
          if(_.indexOf(parameterIds, liData) !== -1) {
            var $hardParameterLi = $hardParameters.find('li[data-id=' + liData + ']');
            
            if($hardParameterLi.length > 0) {
              $hardParameterLi.addClass('hardLiAnimate');
              setTimeout(function(){
                var $aStr = $('<a class="param-weight-value"></a>');
                var $spanStr = $('<span class="soft-constraint-value"></span>');
                
                $hardParameterLi.removeClass('hardLiAnimate');
                $('#soft-parameters-ul').append($hardParameterLi[0]);
                $hardParameterLi.last().append($aStr);
                $hardParameterLi.last().append($spanStr);
                _addSoftConstraintSlideStyle($spanStr);
              }, 2000);
            }
          }
        });
      });
    }
    
    function _addConstraintByCheckedConstraint(checkedConstraintType, checkedConstraintIds) {
      var constraintIcon = cbo.constraintIcon[checkedConstraintType];
      
      if(!!constraintIcon) {
        if(checkedConstraintType === 'budget') {
          var constraintName = inputParameter.parameter.Budget;
          var constraintObject = {};
          constraintObject['id'] = 'budget';
          constraintObject['name'] = constraintName;
          constraintObject['icon'] = constraintIcon;
          constraintObject['type'] = checkedConstraintType;
          constraintObjects['budget'] = constraintObject;
          constraintObjectsKey.push('budget');
        } else if(checkedConstraintType === 'time') {
          var startTime = inputParameter.parameter.AvailableStart,
              endTime = inputParameter.parameter.AvailableEnd,
              constraintName = startTime + '~' + endTime,
              constraintObject = {};
          constraintObject['id'] = 'time';
          constraintObject['name'] = constraintName;
          constraintObject['icon'] = constraintIcon;
          constraintObject['type'] = checkedConstraintType;
          constraintObjects['time'] = constraintObject;
          constraintObjectsKey.push('time');
        } else if(checkedConstraintType === 'hotel') {
          var checkedConstraintObject = locationConfig[checkedConstraintType][checkedConstraintIds];
          var constraintName = checkedConstraintObject.name;
          var constraintEndId = checkedConstraintObject.endId;
          var constraintObject = {};
          constraintObject['id'] = checkedConstraintIds;
          constraintObject['endId'] = constraintEndId;
          constraintObject['name'] = constraintName;
          constraintObject['icon'] = constraintIcon;
          constraintObject['type'] = checkedConstraintType;
          constraintObjects[checkedConstraintIds] = constraintObject;
          constraintObjectsKey.push(checkedConstraintIds.toString());
        }else if(checkedConstraintType === 'outlook') {
          var checkedConstraintObject = locationConfig[checkedConstraintType];
          _.each(checkedConstraintIds, function(checkedConstraintId) {
            var constraintName = checkedConstraintObject[checkedConstraintId].subject;
            var constraintObject = {};
            constraintObject['id'] = checkedConstraintId;
            constraintObject['name'] = constraintName;
            constraintObject['icon'] = constraintIcon;
            constraintObject['type'] = checkedConstraintType;
            constraintObjects[checkedConstraintId] = constraintObject;
            constraintObjectsKey.push(checkedConstraintId);
          });
        } else if(checkedConstraintType === 'food') {
          var checkedConstraintObjects = locationConfig[checkedConstraintType];
          _.each(checkedConstraintObjects, function(checkedConstraintObject) {
            _.each(checkedConstraintObject.restaurant, function(restaurant, key) {
              if(_.indexOf(checkedConstraintIds,key) !== -1) {
                var constraintId = restaurant.id;
                var constraintName = restaurant.name;
                var constraintObject = {};
                constraintObject['id'] = constraintId;
                constraintObject['name'] = constraintName;
                constraintObject['icon'] = constraintIcon;
                constraintObject['type'] = checkedConstraintType;
                constraintObjects[constraintId] = constraintObject;
                constraintObjectsKey.push(constraintId);
              }
            });
          });
          
        } else {
          var checkedConstraintObject = locationConfig[checkedConstraintType];
          _.each(checkedConstraintIds, function(checkedConstraintId) {
            var constraintName = checkedConstraintObject[checkedConstraintId].name;
            var constraintObject = {};
            constraintObject['id'] = checkedConstraintId;
            constraintObject['name'] = constraintName;
            constraintObject['icon'] = constraintIcon;
            constraintObject['type'] = checkedConstraintType;
            constraintObjects[checkedConstraintId] = constraintObject;
            constraintObjectsKey.push(checkedConstraintId);
          });
        }
      } else {
        var checkedConstraintObject = locationConfig[checkedConstraintType];
        _.each(checkedConstraintIds, function(checkedConstraintId) {
          var checkedConstraintObj = checkedConstraintObject[checkedConstraintId];
          var constraintObject = {};
          var constraintName = checkedConstraintObj.Name;
          var constraintIcon = checkedConstraintObj.Icon;
          constraintObject['id'] = checkedConstraintId;
          constraintObject['name'] = constraintName;
          constraintObject['icon'] = 'spot';
          constraintObject['iconUrl'] = constraintIcon;
          constraintObject['type'] = 'spot';
          constraintObjects[checkedConstraintId] = constraintObject;
          constraintObjectsKey.push(checkedConstraintId);
        });
      }
      
      operateOnConstraints.initHardParameter(constraintObjects, constraintObjectsKey);
    }
    
    function _handleWillNotGoToSpots(constraint) {
      $constraintLis = constraint.find('li');
      _.each($constraintLis, function(constraintLi) {
        var $context = $('<div class="will-button">' +
                         '<input type="radio" class="will-class" id="will-yes" checked="checked"/>' +
                         '<input type="radio" class="will-class" id="will-no" style="display: none;" />' +
                       '</div>'),
            $yesTarget = $context.find('#will-yes'),
            $noTarget = $context.find('#will-no'),
            $hideTarget = $context.find('#will-button'),
            $constraintLi = $(constraintLi),
            $constraintLiDiv = $constraintLi.find('.liDiv'),
            constraintLiData = $constraintLi.data('id');
        
        if(constraintObjects[constraintLiData].type === 'spot') {
          var iconUrl = constraintObjects[constraintLiData].iconUrl;
          var iconUrlStrArr = constraintObjects[constraintLiData].iconUrl.split('.');
          var iconUrlStr = iconUrlStrArr[0] + '-1.png';
          var constraintWillData = constraintObjects[constraintLiData].will;
          $constraintLi.off('click').on('click', '.liDiv', function() {
            var isContextExist = $constraintLi.find('.will-button').length;
            if((false === $constraintLi.hasClass('liEnabled')) && (isContextExist === 1)) {
              $constraintLi.find('.will-button').remove();
              $('#will-shade').hide();
            } else if((false === $constraintLi.hasClass('liEnabled')) && (isContextExist === 0)){
              $context.insertAfter($(this));
              $('#will-shade').show();
              $('#will-shade').click(function() {
                $constraintLi.find('.will-button').remove();
                $('#will-shade').hide();
              });
            }
            
            if(constraintWillData === 'no') {
              $yesTarget.hide();
              $noTarget.show().attr('checked', true);
            } else {
              $noTarget.hide();
              $yesTarget.show().attr('checked', true);
            }
            
            $yesTarget.click(function() {
              $constraintLi.attr('data-will', 'no');
              constraintWillData = $constraintLi.attr('data-will');
              $constraintLiDiv.find('span').css('background', 'url(./images/icons/slicesofspot/' + iconUrlStr + ') no-repeat')
                       .css('background-position', '25% 50%')
                       .css('background-size', '100%');
              constraintObjects[constraintLiData]['will'] = 'no';
              $yesTarget.hide();
              $noTarget.show().attr('checked', true);
            });
            
            $noTarget.click(function() {
              $constraintLi.attr('data-will', 'yes');
              constraintWillData = $constraintLi.attr('data-will');
              $constraintLiDiv.find('span').css('background', 'url(./images/icons/slicesofspot/' + iconUrl + ') no-repeat')
                       .css('background-position', '25% 50%')
                       .css('background-size', '100%');
              constraintObjects[constraintLiData]['will'] = 'yes';
              $noTarget.hide();
              $yesTarget.show().attr('checked', true);
            });
          });
        }
      });
    }
    
    function _sentOptimizationData() {
      var $softParameterLis = $('#soft-parameters-ul').find('li'),
          $hardParameterLis = $('#hard-constraint').find('li');
      
      _.each($hardParameterLis, function(hardParameterLi) {
        var $hardParameterLi = $(hardParameterLi),
            hardParamIdValue = $hardParameterLi.data('id'),
            hardParamEndIdValue = $hardParameterLi.data('endid'),
            hardWillNotParamIdValue = $hardParameterLi.data('will');
        
        inputParameter.mandate.push(hardParamIdValue);
        if(!!hardParamEndIdValue) {
          inputParameter.mandate.push(hardParamEndIdValue);
        }
        
        if(!!hardWillNotParamIdValue && hardWillNotParamIdValue === true) {
          inputParameter.unMandate.push(hardParamIdValue);
        }
      });
      
      _.each($softParameterLis, function(softParameterLi) {
        var $softParameterLi = $(softParameterLi),
            softParamIdValue = $softParameterLi.data('id'),
            softParamEndIdValue = $softParameterLi.data('endid'),
            softWillNotParamIdValue = $softParameterLi.data('will'),
            softParamWeightValue = $softParameterLi.find('.soft-constraint-value').data('weight');
        
        inputParameter.softLocation[softParamIdValue] = softParamWeightValue;
        inputParameter.mandate.push(softParamIdValue);
        if(!!softParamEndIdValue) {
          inputParameter.mandate.push(softParamEndIdValue);
        }
        
        if(!!softWillNotParamIdValue && softWillNotParamIdValue === true) {
          inputParameter.unMandate.push(softParamIdValue);
        }
      });
    }
    
    return {
      initHardParameter: function(constraintObjects, constraintObjectsKey) {
        _initHardParameter(constraintObjects, constraintObjectsKey);
      },
      initSoftParameter: function() {
        _initSoftParameter();
      },
      initConstraintDraggable: function() {
        _initConstraintDraggable();
      },
      initConstraintDroppable: function() {
        _initConstraintDroppable();
      },
      /**
       * Move hard constraint to soft constraints automatically when it can not be calculate by hard constraint.
       * @param {Array.<string>} parameterIds represent the hard constraint id that can not be calculate by hard constraint.
       */
      moveConstraintAutomatically: function(parameterIds) {
        _moveConstraintAutomatically(parameterIds);
      },
      /**
       * Add constraint to the constraint list after checked constraint
       * @param {string} checkedConstraintType represent the checked constraint object type.
       * @param {Array.<string>} checkedConstraintIds represent the ids of the checked constraint object.
       */
      addConstraintByCheckedConstraint: function(checkedConstraintType, checkedConstraintIds) {
        _addConstraintByCheckedConstraint(checkedConstraintType, checkedConstraintIds)
      },
      sentOptimizationData: function() {
        _sentOptimizationData();
      },
    }
  }();

  var popup = function() {
    var $contentText;


    return {
      initPopup: function() {

      }
    }
  }();
  //Reset the inputParameter to the original value
  function resetInputParameter() {
    inputParameter = $.extend(true, {}, emptyInputParameter);
  }
  
  function reCalculateParameter(parameterIds, budget, time) {
    var $constraints = $('#parameter').find('.constraint');
    
    _.each($constraints, function(constraint) {
      var $constraintLis = $(constraint).find('li');
      
      _.each($constraintLis, function(constraintLi) {
        $constraintLi = $(constraintLi);
        var constraintLiIdValue = $constraintLi.data('id');
        var constraintLiEndIdValue = $constraintLi.data('endid');
        
        if(_.indexOf(parameterIds, constraintLiIdValue) !== -1) {
          var $slideSpan = $constraintLi.find('.soft-constraint-value');
          $constraintLi.removeClass('liParam');
          $constraintLi.removeAttr('draggable');
          $constraintLi.addClass('liEnabled');
          constraintObjects[constraintLiIdValue]['enabled'] = 'yes'
          console.log(constraintObjects[constraintLiIdValue]);
          $constraintLi.css('cursor', 'auto');
          
          if($slideSpan.length > 0) {
            $constraintLis.data('weight');
            $slideSpan.slider("option", "disabled", true);
          }
          
          if(_.indexOf(inputParameter.mandate, constraintLiIdValue) !== -1) {
            inputParameter.mandate = _.without(inputParameter.mandate, constraintLiIdValue);
          }
          
          if(!!constraintLiEndIdValue && (_.indexOf(inputParameter.mandate, constraintLiEndIdValue) !== -1)) {
            inputParameter.mandate = _.without(inputParameter.mandate, constraintLiEndIdValue);
          }
        }
      });
    });
    if(!!constraintObjects.budget) {
      constraintObjects.budget.name = budget;
      $('#parameter').find('li[data-id="budget"]').find('label').html(budget);
    }
    if(!!constraintObjects.time) {
      var timeArr = constraintObjects.time.name.split('~');
      var endTime = timeArr[1];
      var timeStr = time + '~' + endTime
      constraintObjects.time.name = timeStr;
      $('#parameter').find('li[data-id="time"]').find('label').html(timeStr);
    }
  }
  
  function toggleCostValueProgressBar(flag) {
    if(flag) {
      $('#cost-value').removeClass('cost-value-0');
      $('#cost-value').find('#cost-progress-bar').show();
      $('#cost-value').addClass('cost-value-style');
    } else {
      $('#cost-value').removeClass('cost-value-style');
      $('#cost-value').find('#cost-progress-bar').hide();
      $('#cost-value').addClass('cost-value-0');
    }
  }
  
  function calcutaleCostValue() {
    var costValue = 0;
    var budgetValue = constraintObjects['budget'];
    var maxValue;
    var spotObjects = cbo.controller.map.getAllLocations();
    
    _.each(constraintObjectsKey, function(constraintId) {
      var objectType = constraintObjects[constraintId].type;
      var costValueData = parseInt(locationListObjects[constraintId]);
      
      if(constraintId !== 'budget' && constraintId !== 'time') {
        if(!!softConstraintCost[constraintId]) {
          var softPercentValue = parseInt(softConstraintCost[constraintId]);
          constraintsCost[constraintId] = (softPercentValue * costValueData) / 100;
        } else {
          constraintsCost[constraintId] = costValueData;
        }
      }
    });
    
    _.each(constraintsCost, function(constraintCost, key) {
      costValue = costValue + parseInt(constraintCost);
    });
    
    if(costValue !== 0) {
      $('#cost-value').show();
    }
    
    if(!!budgetValue) {
      if(budgetValue.name === '0') {
        toggleCostValueProgressBar(false);
      } else {
        toggleCostValueProgressBar(true);
        maxValue = budgetValue.name;
      }
    } else {
      toggleCostValueProgressBar(false);
    }
    
    costValue = parseInt(costValue * 1.5);
    
    $('#cost-value').find('#cost-value-span').html(costValue);
    $('#cost-progress-bar').progressbar({
      value: costValue,
      max: maxValue
    });
    $('#cost-value').fadeOut(1000);
  }
  
  function _setParameterUnselect(constraintObjects) {
    var types = [],
        $addList = $("#add-constraint-list"),
        $hotelUnableSelect = $addList.find(".hotel-unable-selected"),
        $budgetUnableSelect = $addList.find(".budget-unable-selected"),
        $timeUnableSelect = $addList.find(".time-unable-selected");
    _.each(constraintObjects, function(item){
      types.push(item.type);
    });
    
    if(_.indexOf(types, 'hotel') != -1) {
      $hotelUnableSelect.css("visibility", "visible");
    } else {
      $hotelUnableSelect.css("visibility", "hidden");
    }
    
    if(_.indexOf(types, 'budget') != -1) {
      $budgetUnableSelect.css("visibility", "visible");
    } else {
      $budgetUnableSelect.css("visibility", "hidden");
    }
    
    if(_.indexOf(types, 'time') != -1) {
      $timeUnableSelect.css("visibility", "visible");
    } else {
      $timeUnableSelect.css("visibility", "hidden");
    }
  }
  
  /**
   * Declare a qtip by those parameter.
   * @param {jQueryObject} $targetElement This is a target place will trigger the popup show event.
   * @param {string} qtipId This is the part of id for the qtip. eg: 'meeting' --> 'qtip-meeting'
   * @param {jQueryObject} $contentText This is the content of the popup.
   * @param {string} showEventName This is the name of the event which will trigger the popup show
   * @param {jQueryObject} $hiddenTarget This is a target place will trigger the popup hide event.
   * @param {json} qtipEvent This is the extends API, we can call some personal function when the events triggered.
   *     eg: 'render', 'show', 'hidden', 'hide' and so on.
   */
  function declareQTip($targetElement, qtipId, $contentText, showEventName, $hiddenTarget, qtipEvents) {
    $targetElement.qtip({
      id: qtipId,
      content: {
        text: $contentText
      },
      position: {
        my: 'center',
        at: 'center',
        target: $(window)
      },
      show: {
        event: showEventName,
        modal: true,
        effect: function() {
          _animatePopupShow(this);
        }
      },
      hide: {
        event: 'click',
        target: $hiddenTarget,
        effect: function() {
          _animatePopupHide(this);
        }
      },
      events: qtipEvents
    });
  }
  
  function _animatePopupShow(popupElement) {
    var $popup = $(popupElement);
    var $overlay = $('#qtip-overlay');
    var screenWidth = $(window).width();
    var popupWidth = $popup.width();
    var popupWidthLegth = (screenWidth - popupWidth) / 2;
    var positionLength = popupWidth + (popupWidthLegth);
    var $overlayDiv;
    var isSpotPopup = ($popup.attr("id") === 'qtip-spot') ? true : false;
    
    $popup.css({'display': 'block', 'position': 'absolute', 'left': positionLength});
    $popup.animate({left: popupWidthLegth}, 'slow', function() {
      if (isSpotPopup) {
        spot.renderMap();
      }
    });
    
    if(isSpotPopup) {
      spot.resizeMap();
    }
    
    $overlayDiv = $overlay.find('div');
    $overlayDiv.css('opacity', '0');
    $overlay.off('click');
    $overlayDiv.animate({"opacity": 0.3}, 500);
  }
  
  function _animatePopupHide(popupElement) {
    var $popup = $(popupElement);
    var screenWidth = $(window).width();
    $popup.animate({left: screenWidth}, 'slow');
  }

  function initWeightValuePopup() {
    var $contentText = $(cbo.view.weightValueTemplate);
    var $noSolutionText = $(cbo.view.noSolutionMessageTemplate);
    var $submitTarget = $contentText.find('#weight-ok');
    var $hiddenTarget = $contentText.find('#weight-cancel');
    var $noTarget = $contentText.find('#no-solution-cancel');
    var $yesTarget = $contentText.find('#no-solution-ok');

    var qtipEvents = {
      "show": function() {
        var $li = $("#hard-constraint").find("li");
        var spotIds = [];
        _.each($li, function(item) {
          spotIds.push($(item).data("id"));
        });
        
        operateOnConstraints.sentOptimizationData();
        $('#weight-chart').radarChart({
          images: ['./images/popularity_weight.png', './images/cost_weight.png', './images/time_weight.png'],
          data: [0.333, 0.333, 0.334]
        })
        
        //only happened when in recalcualte
        if((_.indexOf(spotIds, 7) !== -1) && cbo.config.recalculate) {
          $('#qtip-weight-content').find(".outer-frame").show();
          $('#qtip-weight-content').find('.weight-outer-frame').hide();
          cbo.controller.audioText.playAudioByKey('noResult');
        } else {
          $('#qtip-weight-content').find('.weight-outer-frame').show();
          $('#qtip-weight-content').find(".outer-frame").hide();
        }
      }
    };
    
    declareQTip($("#parameter-optimization"), 'weight', $contentText, 'click', $hiddenTarget, qtipEvents);
    
    $yesTarget.on('click', function() {
      operateOnConstraints.moveConstraintAutomatically([7]);
      $hiddenTarget.click();
      cbo.controller.tts.stop();      
    });
    
    $noTarget.on('click', function() {
      $hiddenTarget.click();
      cbo.controller.tts.stop();
    });
    
    
    $submitTarget.on('click', function() {
      var data = $('#weight-chart').radarChart('getData');
      inputParameter.parameter.PopularityWeight = data[0];
      inputParameter.parameter.CostWeight = data[1];
      inputParameter.parameter.TimeWeight = data[2];
      cbo.controller.layout.showLoadingIcon();
      calculation.calculate();
      cbo.controller.tts.stop();
      $hiddenTarget.click();
    });
  }

  function initTimeSettingPopup() {
    var $contentText = $(cbo.view.chooseTimePopupTemplate),
        $hiddenTarget = $contentText.find("#time-cancel"),
        $submitTarget = $contentText.find("#time-ok"),
        startTimeIdName = "#start-time",
        endTimeIdName = "#end-time",
        startHour = "#start-hour",
        startMin = "#start-min",
        endHour = "#end-hour",
        endMin = "#end-min",
        initStartHour = 'initStartHour',
        initStartMin = 'initStartMin',
        initEndHour = 'initEndHour',
        initEndMin = 'initEndMin',
        currentShowTime = ".ddlabel",
        startTime,
        endTime,
        MIN_LENGTH = 60,
        HOUR_LENGTH = 53,
        LINE_WIDTH = "15",
        STROKESTYLE = "#999",
        qtipEvents = {
          'show': function(event) {
            _cleanTime();
            _showTime();
            _initChangeTime();
          },
          'hide': function(event) {
           // _cleanTime();
          }
        };
    
    declareQTip($("#time-nav"), 'time-setting', $contentText, 'click', $hiddenTarget, qtipEvents);
    
    $submitTarget.on('click', function() {
      startTime = $(startHour).find("#start-hour-dropdown_title").find(currentShowTime).text() +
                  ":" + $(startMin).find("#start-min-dropdown_title").find(currentShowTime).text();
      endTime = $(endHour).find("#end-hour-dropdown_title").find(currentShowTime).text() +
                ":" + $(endMin).find("#end-min-dropdown_title").find(currentShowTime).text();
      inputParameter.parameter.AvailableStart = startTime;
      inputParameter.parameter.AvailableEnd = endTime;
      // TODO send startTime and endTime to backend.
      operateOnConstraints.addConstraintByCheckedConstraint('time');
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
    
    function _initChangeTime() {
      _changeTime($(startHour), initStartHour);
      _changeTime($(startMin), initStartMin);
      _changeTime($(endHour), initEndHour);
      _changeTime($(endMin), initEndMin);
    }
    
    function _changeTime($dropdownParentDom, flag) {  //use to flag 'start time' or 'end time' draw
      var selectTime,
          defaultTime;
      $dropdownParentDom.find("li").on('click', function(){
        selectTime = $(this).find(".ddlabel").text();
        if (initStartHour === flag) {
          defaultTime = $(startMin).find("#start-min-dropdown_title").find(currentShowTime).text();
          _calculateCurrentClock(selectTime, defaultTime, "start-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
        } else if (initStartMin === flag) {
          defaultTime = $(startHour).find("#start-hour-dropdown_title").find(currentShowTime).text();
          _calculateCurrentClock(defaultTime, selectTime, "start-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
        } else if (initEndHour === flag) {
          defaultTime = $(endMin).find("#end-min-dropdown_title").find(currentShowTime).text();
          _calculateCurrentClock(selectTime, defaultTime, "end-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
        } else if (initEndMin === flag) {
          defaultTime = $(endHour).find("#end-hour-dropdown_title").find(currentShowTime).text();
          _calculateCurrentClock(defaultTime, selectTime, "end-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
        }
      });
    }
    
    function _showTime() {
      _generateTimeDropdownList("startHour", "start-hour-dropdown", startTimeIdName, startHour, 23);
      _generateTimeDropdownList("startMin", "start-min-dropdown", startTimeIdName, startMin, 59);
      _generateTimeDropdownList("endHour", "end-hour-dropdown", endTimeIdName, endHour, 23);
      _generateTimeDropdownList("endMin", "end-min-dropdown", endTimeIdName, endMin, 59);
      $("#qtip-time-setting select").msDropDown();
      // must init after generate dropdown
      var startHourTime = $(startHour).find("#start-hour-dropdown_title").find(currentShowTime).text(),
          startMinTime = $(startMin).find("#start-min-dropdown_title").find(currentShowTime).text(),
          endHourTime = $(endHour).find("#end-hour-dropdown_title").find(currentShowTime).text(),
          endMinTime = $(endMin).find("#end-min-dropdown_title").find(currentShowTime).text();
      _calculateCurrentClock(startHourTime, startMinTime, "start-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
      _calculateCurrentClock(endHourTime, endMinTime, "end-time-drawing", MIN_LENGTH, HOUR_LENGTH, LINE_WIDTH, STROKESTYLE);
    }
    
    function _cleanTime() {
      var $startTime = $(startTimeIdName),
          $endTime = $(endTimeIdName);
      $startTime.find(startHour).empty();
      $startTime.find(startMin).empty();
      $endTime.find(endHour).empty();
      $endTime.find(endMin).empty();
    }
    
    function _generateTimeDropdownList(selectName, selectIdName, parentObjectName, findObjectName, maxLength) {
      var j,
          dropDownList,
          times = new Array(maxLength);
          
      for (var i = 0; i <= maxLength; i++) {
        if (i <= 9) {
          j = '0' + i;
        } else {
          j = '' + i;  
        }
        times[i] = j;
      }
      var list = cbo.view.dropDownTemplete;
      dropDownList = _.template(list, {selectName:selectName, selectIdName:selectIdName, showObject:times});
      $(parentObjectName).find(findObjectName).append(dropDownList);
    }

    }
  
  function _calculateCurrentClock(hours, minutes, canvasIdName, minLength, hourLength, lineWidth, strokeStyle) {
    var _basicRadian = 2 * Math.PI / 360,
        _basicMinuteAngle = 6, //one minute angle
        _basicHourAngle = 30, 
        _basicHourPerAngle = 0.5, // hour angle when minute move 1min (360/60 = 30/x)
        _minutesAngle =  minutes * _basicMinuteAngle,   // current minute angle
        _hoursAngle = hours * _basicHourAngle + minutes * _basicHourPerAngle,
        // position of minute
        minutesPointX = Math.sin(_minutesAngle * _basicRadian) * minLength + 100,
        minutesPointY = 100 - Math.cos(_minutesAngle * _basicRadian) * minLength,
        // position of hour
        hoursPointX = Math.sin(_hoursAngle * _basicRadian) * hourLength + 100,
        hoursPointY = 100 - Math.cos(_hoursAngle * _basicRadian) * hourLength,
        canvas = document.getElementById(canvasIdName),
        context;
    if (canvas.getContext) {
      context = canvas.getContext("2d");
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;
      context.lineCap="round"; // 设置或返回线条的结束端点样式
      context.lineJoin="round";  // 设置或返回两条线相交时，所创建的拐角类�?
      
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    // draw minute
    context.moveTo(100, 100);
    context.lineTo(minutesPointX, minutesPointY);
    // draw hour
    context.moveTo(100, 100);
    context.lineTo(hoursPointX, hoursPointY);

    context.stroke();
  }

  function initHotelChoosePopup() {
    var $hotelTemplete = $(cbo.view.hotelListTemplate),
        $hiddenTarget = $hotelTemplete.find('#hotel-cancel'),
        $submitTarget = $hotelTemplete.find('#hotel-ok'),
        hotelId,
        lineLength = 6,
        columnLength = 2,
        $hotels,
        qtipEvents = {
          'show': function(event) {
            $hotels = _refreshRenderColumnsForPopup('qtip-hotel', locationConfig.hotel, lineLength, cbo.view.hotelOneColumnListTemplate, columnLength).find('.hotel-message');
            $hotels.on('click', function() {
              $hotels.removeClass("selected-hotel");
              $(this).addClass("selected-hotel");
            });
          }
        };

        declareQTip($('#hotel-nav'), 'hotel', $hotelTemplete, 'click', $hiddenTarget, qtipEvents);

    $submitTarget.on('click', function() {
      hotelId = $("#qtip-hotel").find(".selected-hotel").data("nid");
      if (undefined !== hotelId) {
        operateOnConstraints.addConstraintByCheckedConstraint('hotel', hotelId);
      }
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }
  /**
   *  Init the parameter navigation.
   */
  function initParameterNav() {
    $("#parameter-nav").append(cbo.view.parameterNavTemplate);
  }

  /**
   *  Get the value of month by the datetime.
   *  @param {string} datetime This is the datetime that i want to know the month it is belong to.
   */
  function _getMonthByDate(datetime) {
    if(datetime === undefined) {
      return;
    }
    var monthValue = parseInt(datetime.substr(5,2), 10);
    return monthData[monthValue];
  }

  /**
   *  Get the value of day by the datetime.
   *  @param {string} datetime This is the datetime that i want to know the day it is belong to.
   */
  function _getDayByDate(datetime) {
    if(datetime === undefined) {
      return;
    }
    datetime = datetime.substring(datetime.length-2).replace('-', '');
    return datetime;
  }

  /**
   *  This is the Method of us gather the ids of the location we checked from the popup in a signal type.
   *  @param {Array.<string>} mandateIds This is the array about ids of the location for constraint.
   *  @param {Object} dataList This is the data in a singal type for gather the mandates which was checked.
   *  @return {Array.<string>} targetIds This is the array of the ids we checked in this type.
   */
  function _getTargetIdsByMandateIds(mandateIds, dataList) {
    var targetIds = [];
    _.each(mandateIds, function(id, key) {
      _.each(dataList, function(targetId, dataId) {
        if (key === dataId) {
            targetIds.push(key);
          }
      });
    });
    return targetIds;
  }

  /**
   *  Hide the node in the type named 'prefix'.
   *  @param {Array.<string>} targetIds This is the ids for hide the node.
   *  @param {string} prefix This is the name of the type that we hide the node.
   */
  function _hideNodeByTheChoseMandateIds(targetIds, prefix) {
    _.each(targetIds, function(item) {
      $('#' + prefix + '-' + item).hide().removeClass('checked-' + prefix).addClass('unchecked-' + prefix);
    });
  }

  /**
   *  Show the node when we delete it from the constraints.
   *  @param {string} targetId This is the id of the node we will show.
   *  @param {string} prefix This is the name of the type that we hide the node.
   */
  function _showNodeByTheDeletedConstraint(targetId, prefix) {
    var $targetElement;
    if (prefix === 'outlook') {
      $targetElement = $('#meeting-' + targetId);
      $targetElement.show().removeClass('checked-meeting').addClass('unchecked-meeting');
    } else if ((prefix === 'hotel') || (prefix === 'show')) {

    } else if (prefix === 'food') {
      $targetElement = $('#' + prefix + '-' + targetId);
      $targetElement.show().removeClass('checked-' + prefix).addClass('unchecked-' + prefix);
    } else if (prefix === 'spot'){
      spot.enableMarker(targetId);
    }
  }

  /**
   *  Init the meeting popup.
   */
  function initOutlookPopup() {
    // The data for show meeting list, and those maybe get by outlook.
    var meetingOptions = {
      startDate: '2013-2-20',
      endDate: '2013-2-21',
      outlook: null,
      getMonthByDate : _getMonthByDate,
      getDayByDate: _getDayByDate
    };
    var uom = new Date();
    meetingOptions.startDate = uom.getFullYear() + '-' + (uom.getMonth() + 1) + '-' + uom.getDate();
    uom.setDate(uom.getDate() + 1);
    meetingOptions.endDate = uom.getFullYear() + '-' + (uom.getMonth() + 1) + '-' + uom.getDate();
    var $outlookCover, basicPopup, $contentText, $hiddenTarget, $submitTarget, $meetings, qtipEvents;
    var outlooks = [];
    var outlookArray = [];
    _.each(locationConfig.outlook, function(item) {
      item.date = meetingOptions.startDate;
      outlookArray.push(item);
    });
    outlookArray[outlookArray.length - 1].date = meetingOptions.endDate;
    meetingOptions.outlook = outlookArray;
    basicPopup = cbo.view.popupWithoutCloseTemplate;
    $contentText = $(basicPopup).append(_.template(cbo.view.meetingListTemplate, meetingOptions));
    $hiddenTarget = $contentText.find('#metting-cancel');
    $submitTarget = $contentText.find('#meeting-ok');

    $meetings = $contentText.find('.all-meetings');

    qtipEvents = {
       'show': function(event) {
        outlooks = _getTargetIdsByMandateIds(constraintObjects, locationConfig.outlook);
        _hideNodeByTheChoseMandateIds(outlooks, 'meeting');
      }
    }

    // Declare a qtip.
    declareQTip($("#meeting-nav"), 'meeting', $contentText, 'click', $hiddenTarget, qtipEvents);

    // Add click listener for the meeting area.
    _.each($meetings, function(item) {
      $(item).on('click', function() {
        _changeCheckedFlag(this, 'unchecked-meeting', 'checked-meeting');
      });
    });

    $submitTarget.on('click', function() {
      console.log('Gather the meeting data for prepare inputParameter.');
      operateOnConstraints.addConstraintByCheckedConstraint('outlook', _gatherCheckedConstraintIds($contentText.find('.checked-meeting'), 'meeting-'));
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }

  /**
   *  Gather the ids of the checked constraints.
   *  @param {jQueryObject} $checkConstraints the targets whose were checked by user.
   *  @param {string} prefix This is the prefix of the checked ids.
   */
  function _gatherCheckedConstraintIds($checkConstraints, prefix) {
    var checkedConstraintIds = [];
    var checkedId;
    _.each($checkConstraints, function(item) {
      checkedId = item.id;
      checkedConstraintIds.push(checkedId.replace(prefix, ''));
    });
    return checkedConstraintIds;
  }

  /**
   *  Change the flag when user checked this element in the popup.
   *  @param {DomElement} eventElement This is a dom element for hold the style of the status for meeting choosed or unchoosed.
   */
  function _changeCheckedFlag(eventElement, uncheckedClassName, checkedClassName) {
    var $eventElement = $(eventElement);
    if ($eventElement.hasClass(uncheckedClassName)) {
          $eventElement.removeClass(uncheckedClassName).addClass(checkedClassName);
        } else {
          $eventElement.removeClass(checkedClassName).addClass(uncheckedClassName);
        }
  }

  /**
   *  Init the spot popup.
   */
  function initSpotPopup() {
    var $contentText = $(cbo.view.spotListTemplate),
        $hiddenTarget = $contentText.find('#spot-cancel'),
        $submitTarget = $contentText.find('#spot-ok'),
        canvas = document.createElement("DIV"),
        $spots, dataIdList;
    var qtipEvents = {
      'hide': function(event) {
        spot.restoreMap();
      }
    }

    $(canvas).css({'width': '1176px', 'height':'595px', 'margin-left': '20px'});
    spot.initMap(canvas);
    $contentText.prepend(canvas);
    declareQTip($("#spot-nav"), 'spot', $contentText, 'click', $hiddenTarget, qtipEvents);
    
    $submitTarget.on('click', function() {
    console.log(spot.getCheckedSpots());
    operateOnConstraints.addConstraintByCheckedConstraint('spot', spot.getCheckedSpots());
      dataIdList = _getTargetIdsByMandateIds(constraintObjects, locationConfig.spot);
      spot.disableCheckedSpots(dataIdList);
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }
  /**
   * Init the food list popup.
   */
  function initFoodListPopup() {
    var $contentText, lineLength, $hiddenTarget, $submitTarget, $foods, $food, $foodRank, rankWidth, realRank, realWidth, dataList;
    var qtipEvents = {
      'show': function(event) {
        dataList = [];
        _.each(locationConfig.food, function(items) {
          dataList = _.union(dataList, _getTargetIdsByMandateIds(constraintObjects, items.restaurant));
        });
        _hideNodeByTheChoseMandateIds(dataList, 'food');
      }
    }
    lineLength = 2;
    rankWidth = 90;
    $contentText = $(cbo.view.foodListTemplate);
    
    $contentText.find('.inner-content').append(_renderColumnsForPopup(locationConfig.food, lineLength, cbo.view.foodListItemsTemplate));
    
    $hiddenTarget = $contentText.find('#food-cancel');
    $submitTarget = $contentText.find('#food-ok');
    $foods = $contentText.find('.default-food');

    declareQTip($("#food-nav"), 'food', $contentText, 'click', $hiddenTarget, qtipEvents);

    _.each($foods, function(item) {
      $food = $(item);
      $foodRank = $food.find('.food-rank');
      realRank = $foodRank.data('rank');
      realWidth = rankWidth / 5 * realRank;
      $foodRank.next('.real-rank').width(realWidth);

      $food.find('.food-checkbox').on('click', function() {
        _changeCheckedFlag($(this).closest('.default-food'), 'unchecked-food', 'checked-food');
      });
    });

    $submitTarget.on('click', function() {
      console.log('Gather the food data for prepare inputParameter.');
      operateOnConstraints.addConstraintByCheckedConstraint('food', _gatherCheckedConstraintIds($contentText.find('.checked-food'), 'food-'));
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }

  /**
   *  Rander the data list with a setting length of line.
   *  @param {Array.<Object>} dataList This is a list of data we want to show for others.
   *  @param {number} lineLength This is a number for the length of the line.
   *  @param {string} popupColumnTemplate This is the HTML template for showing the data.
   *  @retuen {string} templateStr This is the template about the data we need show it by columns.
   */
  function _renderColumnsForPopup(dataList, lineLength, popupColumnTemplate) {
    var templateStr = '';
    var signalColumn = [];
    var i = 1;
    _.each(dataList, function(item) {
      signalColumn.push(item);
      if (i === lineLength) {
        templateStr += _.template(popupColumnTemplate, {data: signalColumn, currentDate: getCurrentDate()});
        i = 0;
        signalColumn = [];
      }
      ++i;
    });
    if (signalColumn.length > 0) {
      templateStr += _.template(popupColumnTemplate, {data: signalColumn, currentDate: getCurrentDate()});
    }
    return templateStr;
  }

  /**
   *  Refresh rander the data list with a setting length of line or column, if column was defined, we need to use the 
   *  length of column with the first priority.
   *  @param {string} targetPopupId This is the id of the popup.
   *  @param {Object} totalData This is all the data we will show for others.
   *  @param {number} lineLength This is the length of the line we will show the items.
   *  @param {string} randerColumnTemplate This is the template we rander the data for showing items.
   *  @param {number} columnLength This is the length of the column in the popup for showing data.
   *  @return {jQueryObject} $targetPopup This is the jQuery object for the popup.
   */
  function _refreshRenderColumnsForPopup(targetPopupId, totalData, lineLength, randerColumnTemplate, columnLength) {
    var dataList = [];

    var checkedItemIds = _getTargetIdsByMandateIds(constraintObjects, totalData);

    var $targetPopup = $('#'+targetPopupId);
    $targetPopup.find('ul').remove();
    
    _.each(totalData, function(data, key) {
      if (_.indexOf(checkedItemIds, key) === -1) {
        if ((targetPopupId === 'qtip-hotel')) {
          if (data.endId !== undefined) {
            dataList.push(data);
          }
        } else {
          dataList.push(data);
        }
      }
    });
    if (columnLength !== undefined) {
      lineLength = Math.ceil(dataList.length / columnLength);
    }
    if (targetPopupId === 'qtip-hotel') {
      lineLength = lineLength / 2;
    }
    $targetPopup.find('.inner-content').append(_renderColumnsForPopup(dataList, 3, randerColumnTemplate));
    return $targetPopup;
  }
  
  function getCurrentDate() {
    var currentDate,
        myDate = new Date(),
        myMonth = myDate.getMonth() + 1,
        myDay = myDate.getDate();
        
    if(myMonth < 10) {
      myMonth = '0' + myMonth;
    }
    
    if(myDay < 10) {
      myDay = '0' + myDay;
    }
    
    currentDate = myDate.getFullYear() + '-';
    currentDate += myMonth + '-';
    currentDate += myDay;
    
    return currentDate;
  }
  
  /**
   *  Init the show list popup.
   */
  function initShowPopup() {
    var $contentText, lineLength, $hiddenTarget, $submitTarget, $shows;
    var qtipEvents;
    lineLength = 3;
    
    $contentText = $(cbo.view.showListTemplate);
    $hiddenTarget = $contentText.find('#show-cancel');
    $submitTarget = $contentText.find('#show-ok');
    
    qtipEvents = {
      'show': function(event) {
        $shows = _refreshRenderColumnsForPopup('qtip-show', locationConfig.show, lineLength, cbo.view.showListItemsTemplate).find('.default-show');
        _.each($shows, function(item) {
          $(item).find('.show-checkbox').on('click', function() {
            _changeCheckedFlag($(this).closest('.default-show'), 'unchecked-show', 'checked-show');
          });
        });
      }
    }

    declareQTip($('#show-nav'), 'show', $contentText, 'click', $hiddenTarget, qtipEvents);

    console.log('Gather the show data for prepare inputParameter.');
    $submitTarget.on('click', function() {
      operateOnConstraints.addConstraintByCheckedConstraint('show', _gatherCheckedConstraintIds($contentText.find('.checked-show'), 'show-'));
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }

  /**
   *  Gather the budget legends into a array.
   *  @param {number} maxBudget This the max value of budget.
   *  @param {number} stepBudget This is the step of the legend.
   *  @return {Array.<number>} budgetLegends this the legend array for show in the popup.
   */
  function _gatherBudgetLegendsArray(maxBudget, stepBudget) {
    var budgetLegends = [];
    var i, legendLength;

    legendLength = parseInt((maxBudget / stepBudget), 10);
    for(i = 0; i <= legendLength; i += 2) {
      budgetLegends.push(stepBudget * i);
    }
    if((maxBudget % stepBudget) != 0) {
      budgetLegends[legendLength / 2] = maxBudget;
    } 
    return budgetLegends;
  }

  /**
   *  Init the budget popup.
   */
  function initBudgetPopup() {

    var $contentText = $(_.template(cbo.view.parameterBudgetTemplate, {budget: inputParameter.parameter.Budget}));
    var budgetLegends = [];
    var minBudget = 0, stepBudget = 500, maxBudget = inputParameter.parameter.MoneyMax;
    var legendWidth, sliderWidth = 842;
    var $hiddenTarget = $contentText.find('#budget-cancel');
    var $submitTarget = $contentText.find('#budget-ok');

    // Init the slider by jQuery ui.
    var $slider = $contentText.find("#budget-slider").slider({
      value: inputParameter.parameter.Budget,
      min: minBudget,
      max: maxBudget,
      slide: function(event, ui) {
        $contentText.find(".budget-value").text(ui.value);
      }
    });
    var qtipEvents;

    budgetLegends = _gatherBudgetLegendsArray(maxBudget, stepBudget);
    legendWidth = sliderWidth / (budgetLegends.length - 1);
    // Add the legends for the slider.
    $slider.after(_.template(cbo.view.budgetLegendTemplate, {'legendArray': budgetLegends, 'legendWidth': legendWidth}));

    qtipEvents = {
      'show': function(event) {
        $('.budget-value').text('0');
        $("#budget-slider").slider( "value", 0);
      }
    }
    declareQTip($("#budget-nav"), 'budget', $contentText, 'click', $hiddenTarget, qtipEvents);

    $submitTarget.on('click', function() {
      //TODO Judge the budget image was in parameter or not, if not add into it.
      console.log('Add or update a budget image into the parameter');
      inputParameter.parameter.Budget = $contentText.find('.budget-value').text();
      operateOnConstraints.addConstraintByCheckedConstraint('budget');
      $hiddenTarget.click();
      setTimeout(function() {
        calcutaleCostValue();
      }, 500);
    });
  }

  return {
    init: function() {
      operateOnConstraints.initSoftParameter();
      operateOnConstraints.initConstraintDraggable();
      operateOnConstraints.initConstraintDroppable();
      // Init the navigation links.
      initParameterNav();
      
      cbo.model.locationList.loadLocationList(function(result) {
        locationList = result;
        _.each(locationList.value, function(location) {
          locationListObjects[location.ID] = location.Cost;
        });
        
        cbo.model.locationConfig.loadLocationConfig(function(result) {
          locationConfig = result;
          cbo.controller.map.initLocations(locationList, locationConfig); 
          //TODO init all the popup.
          // Init the budget popup
          initBudgetPopup();
          initWeightValuePopup();
          initTimeSettingPopup();
          initHotelChoosePopup();
          initOutlookPopup();
          initShowPopup();
          initFoodListPopup();
          initSpotPopup();
        });
      });
      
      //stop current audio and begin to play optimization audio
      $('#parameter-optimization').click(function() {
        cbo.controller.tts.stop();
        cbo.controller.audioText.playAudioByKey('optimization');
      });
    },
    reCalculateParameter: function(parameterIds, buddget, time) {
      reCalculateParameter(parameterIds, buddget, time);
    },
    declareQTip: function ($targetElement, qtipId, $contentText, showEventName, $hiddenTarget, qtipEvents) {
      declareQTip($targetElement, qtipId, $contentText, showEventName, $hiddenTarget, qtipEvents);
    },
    calculateCurrentClock: function(hours, minutes, canvasIdName, minLength, hourLength, lineWidth, strokeStyle) {
      _calculateCurrentClock(hours, minutes, canvasIdName, minLength, hourLength, lineWidth, strokeStyle)
    },
    /**
     * Subscribe or listen to the parameter whether has new plan.
     * @param {function} fCallback Callback function to be invoked when return new plan.
     */
    subscribe: function(fCallback) {
      callbacks.add(fCallback);
    },
  };
}();

/**
 * Display the location list of the current plan
 */
cbo.controller.planSequence = function() {
  var $planSequence,
      $planTimeLabel,
      prevPopupInfoBoxNo,
      remaindBudget;
  // show plan senquence
  function displayRouteList(routeList) {
    var spotNames = [],
        planSequenceTemplete,
        width,
        routeStartTime,
        routeEndTime,
        timeBudgetShowTemplete,
        $startTimeLabel,
        $endTimeLabel,
        $timeBudgetShow = $("#time-budget-show"),
        $lastLi,
        planSequenceContent = _.template(cbo.view.planSequenceTemplete, {spotNames: routeList.output});
    $planSequence.empty().append(planSequenceContent);
    $lastLi = $planSequence.find("li").last();
    $planTimeLabel = $planSequence.find(".plan-sequence-item").find(".plan-time");
    // replace start time and end time with flag
    $startTimeLabel = $planSequence.find("li").first().find(".plan-time");
    $endTimeLabel = $lastLi.find(".plan-time");
    routeStartTime = $startTimeLabel.data("departure-time");
    routeEndTime = $endTimeLabel.data("departure-time");
    $startTimeLabel.html(_.template(cbo.view.planSequenceStartFlag, {time: routeStartTime}));
    $endTimeLabel.html(_.template(cbo.view.planSequenceStartFlag, {time: routeEndTime}));
    
    // replace start time with flag when calculate
    // if (true === cbo.config.recalculate) {
      // $restartTimeLabel = $planSequence.find("li").eq(2).find(".plan-time");
      // routeRestartTime = $restartTimeLabel.data("departure-time");
      // $restartTimeLabel.html(_.template(cbo.view.planSequenceStartFlag, {time: routeRestartTime}));
    // }
    
    // show the star
    // _initStarCount('.shopping-star');
    // _initStarCount('.culture-star');
    // _initStarCount('.effort-star');
    
    $lastLi.find("dd").remove();
    $lastLi.find("button").remove();
    //init the start time on the map
    remaindBudget = routeList.totalCost;
    timeBudgetShowTemplete = _.template(cbo.view.budgetShowTemplete, {startTime: routeList.entryTime, remainderBudget: remaindBudget});
    $timeBudgetShow.empty().append(timeBudgetShowTemplete);
    
     // re-draw clock
    times = routeList.entryTime.split(":");
    startHour = parseInt(times[0], 10);
    startMin = parseInt(times[1], 10);
    cbo.controller.parameter.calculateCurrentClock(startHour, startMin, "start-time-show-drawing", 15, 10, "5", "#666");
    
    $timeBudgetShow.show();
    
    _initReturnParameter();
    _initStopAnimation();
    _initStartTime();
    _initRemaindCost();
  }
  
  /*function _initStarCount(className) {
    var $starValue,
        rankWidth = 70,
        $totalRank,
        realRank;
    $starValue = $planSequence.find(className);
    _.each($starValue, function(value) {
      $totalRank = $(value).find(".total-rank");
      realRank = $totalRank.data('rank');
      realWidth = rankWidth / 5 * realRank;
      $totalRank.next(".real-rank").width(realWidth);
    });
  }*/
  
  function _initStopAnimation() {
    $("#stop-animation-btn").on("click", function(){
      cbo.controller.map.stopAnimation();
      $(this).attr("disabled", "disabled");
      cbo.controller.tts.stop();
    });
  }
  
  function _initReturnParameter() {
    $planSequence.find("#return-config-btn").on("click", function(){
      cbo.config.recalculate = false;
      cbo.controller.layout.flipToParameter();
    });
  }
  
  // add animation to play the plan senquence
  function _addAnimationOfRouteList(senquenceNumber) {
    // var $planSequenceContent = $planSequence.find('ul');
    $planTimeLabel.removeClass("active-plan");
    $planSequence.find("#location" + senquenceNumber).parent().prev().addClass("active-plan");
    _changeTimeBudget();  // show the time budget on the map
    // if (senquenceNumber > 0) {
      // $planSequenceContent.scrollTop($planSequenceContent.scrollTop() + 100);
    // }	
  }
  
  function _initStartTime() {
    var $lastPlanTime, startTime, lastDepartureTime, pathCostTime;
    $planSequence.find(".plan-time").each(function() {
      $this = $(this);
      if ($this.find("img").length <= 0) {
        $lastPlanTime = $this.parent().prev("li").find(".plan-time");
        lastDepartureTime = $lastPlanTime.data("departure-time");
        pathCostTime = $lastPlanTime.data("time-cost");
       _calculateStartTime($this, lastDepartureTime, pathCostTime);
      }
    });
    
  }
  
  function _calculateStartTime($this, lastDepartureTime, pathCostTime) {
    var times = [], hour, min, startTimeMins, startHour, startMin, startTime;
    times = lastDepartureTime.split(":");
    hour = parseInt(times[0], 10);
    min = parseInt(times[1], 10);
    pathCostTime = parseInt(pathCostTime, 10);
    startTimeMins = hour * 60 + min + pathCostTime;
    startHour = Math.floor(startTimeMins / 60);
    startMin = startTimeMins % 60;

   
    if (startHour < 10) {
      startHour = '0' + startHour;
    }
    
    if (startMin < 10) {
      startMin = '0' + startMin;
    }
    
    startTime = startHour + ":" +startMin;
    $this.text(startTime);
  }
  
  function _initRemaindCost() {
    var currentSenquenceNumber,
        pathCost = 0,
        ticketCost = 0,
        $this;
        
    $planSequence.find(".plan-location").each(function(){
      $this = $(this);
      currentSenquenceNumber = $this.data("sid"); 
      
      if (currentSenquenceNumber > 0) {
        pathCost = $planSequence.find("#location" + (currentSenquenceNumber - 1)).siblings("dd").find(".path-cost").text();
        ticketCost = $this.data("cost");
      }
      remaindBudget = remaindBudget - ticketCost - pathCost;
      $this.attr('data-reminder-cost', remaindBudget);
    });
  }
  
  function _changeTimeBudget() {
    var startTime,
        remaindBudget,
        $activePlan = $planSequence.find(".active-plan"),
        $startImg = $activePlan.find("img"),
        $timeBudgetShow = $("#time-budget-show"),
        isHasImg = $startImg.length,
        times = [],
        startHour,
        startMin;
        
    if(0 === isHasImg) {
      startTime = $activePlan.text();
    } else {
      startTime = $startImg.data("time");
    }
    remaindBudget = $activePlan.siblings("dl").find("dt").first().data("reminder-cost");
    
    // re-draw clock
    times = startTime.split(":");
    startHour = parseInt(times[0], 10);
    startMin = parseInt(times[1], 10);
    cbo.controller.parameter.calculateCurrentClock(startHour, startMin, "start-time-show-drawing", 15, 10, "5", "#666");
        
    $timeBudgetShow.find("#time").text(startTime);
    $timeBudgetShow.find("#budget").text(remaindBudget);
  }
  
  // add click event on current plan sequence to view the detail
  function _addClickEvent() {
    var $this,
        $currentDetail,
        currentSequenceNo,
        completeFlag,
        $planDetais,
        totalLiCount = $planSequence.find(".plan-sequence-item").length - 1;
    
   
      $planSequence.find('dl').on('click', function() {
        $planSequence.find(".recalculate").hide();
        $this = $(this);
        // current show route high light
        $planTimeLabel.removeClass("active-plan");
        $this.prev("label").addClass("active-plan");
        _changeTimeBudget();
        
        // show current route detail message
        $currentDetail = $this.find("dd");
        currentSequenceNo = $this.find(".plan-location").data('sid');
        completeFlag = $currentDetail.css('display');
        $planDetais = $planSequence.find(".plan-sequence-item").find("dd");
        
        $planDetais.removeClass("active-plan-detail");
        $currentDetail.addClass("active-plan-detail");
        if(currentSequenceNo < totalLiCount){
          if(completeFlag === 'none') {
            $planDetais.hide();
            $planSequence.find(".recalculate").hide();
            $currentDetail.show();
            $planSequence.find(".active-plan").siblings(".recalculate").show();
            //_initRecaculateParameter();
            if (prevPopupInfoBoxNo >= 0) {
              cbo.controller.map.replaceinfoBox(prevPopupInfoBoxNo, false);
            }
            cbo.controller.map.replaceinfoBox(currentSequenceNo, true);
            prevPopupInfoBoxNo = currentSequenceNo;
          } else {
            $currentDetail.hide();
          }
        } else {
          // to do with the last location specially
          $planDetais.hide();
          if (prevPopupInfoBoxNo >= 0) {
            cbo.controller.map.replaceinfoBox(prevPopupInfoBoxNo, false);
          }
          cbo.controller.map.replaceinfoBox(currentSequenceNo, true);
          prevPopupInfoBoxNo = currentSequenceNo;
        }
      })
      
      if(true === cbo.config.recalculate) {
        $planSequence.find("li").eq(0).find('dl').off("click");
        $planSequence.find("li").eq(1).find('dl').off("click");
      }
    
  }
  
  // add keyboard shortcuts event
  function _addKeyboardEvent() {
    var i,
        planIndex = $planSequence.find(".plan-location").length - 1,
        $currentDetail,
        keycode,
        $activePlan;
    
    $(document).off('keyup').on('keyup', function (event) {
      keycode = event.keyCode;
      ctrkey = event.ctrlKey;
      if (39 === keycode) {  //right
         _showDetailByKeyBoard(keycode);
         //_initRecaculateParameter();
      } else if (27 === keycode) {  // esc
        cbo.controller.map.stopAnimation();
        cbo.controller.tts.stop();
        // $("#stop-animation-btn").attr("disabled", "disabled");
      } else if (ctrkey && (13 === keycode)) {  // enter
        cbo.controller.audioText.playAudioByKey('cover');
        cbo.controller.cover.showPeopleAnimation();
      } else if (ctrkey && (40 === keycode)) {  // down
        cbo.config.changeRouteList = true;
      } else if (ctrkey && (188 === keycode)) {  // <
        //cbo.config.engineeName = 'native';
      } else if (ctrkey && (190 === keycode)) {  // >
        //cbo.config.engineeName = 'Lois TTS US English';
      }
    });
    
    function _showDetailByKeyBoard(keycode) {
      $activePlan = $planSequence.find(".active-plan").length;
      if ((undefined != prevPopupInfoBoxNo) && ($activePlan > 0)) {
        i = prevPopupInfoBoxNo;
      } else {
        if (true === cbo.config.recalculate) {
          i = 1;
        } else {
          i = -1;
        }
      }
      i++;
      if(i > planIndex){
        i = planIndex;
       // $(document).off('keyup');
      } else {
        _addAnimationOfRouteList(i);
        _changeTimeBudget();  // change the departureTime and remainder budget on the map
        _showCurrentDetail(i);
        if (i > 0) {
          cbo.controller.map.replaceinfoBox(prevPopupInfoBoxNo, false);
        }
        cbo.controller.map.replaceinfoBox(i, true);
        prevPopupInfoBoxNo = i;
      }
    }
  }
  
  // add event to show detail message
  function _showCurrentDetail(i) {
    $planSequence.find("dd").hide();
    $planSequence.find(".recalculate").hide();
    $planSequence.find("#location" + i).siblings("dd").show();
    $planSequence.find("#location" + i).parent().siblings(".recalculate").show();
  }
  
   function _initRecaculateParameter() {
      var $timeBudgetShow = $("#time-budget-show"),
          currentTime,
          remaindBudget,
          visitedLocation = [],
          $this,
          sequeceNo = $planSequence.find(".active-plan").siblings("dl").find("dt").first().data('sid');

        cbo.config.recalculate = true;
        //TODO re-caculate the paramaters
        startTime = $timeBudgetShow.find("#time").text();
        remaindBudget = $timeBudgetShow.find("#budget").text();
        $planSequence.find(".plan-location").each(function() {
          $this = $(this);
          if($this.data('sid') <= sequeceNo) {
            visitedLocation.push($this.data("nid"));
          }
        });
        cbo.controller.parameter.reCalculateParameter(visitedLocation, remaindBudget, startTime);
        cbo.controller.layout.flipToParameter();
    }
  
  function _applyPlanSequenceAnimation() {
      var $timeBudgetShow = $("#time-budget-show"),
          $lastLi = $planSequence.find("li").last(),
          time = $lastLi.find("label").first().data("departure-time"),
          budget = $lastLi.find("dt").first().data("reminder-cost"),
          times = time.split(":"),
          startHour = parseInt(times[0], 10),
          startMin = parseInt(times[1], 10);
      // re-draw clock
      cbo.controller.parameter.calculateCurrentClock(startHour, startMin, "start-time-show-drawing", 15, 10, "5", "#666");
      $planSequence.find(".active-plan").removeClass("active-plan");
      $timeBudgetShow.find("#time").text(time);
      $timeBudgetShow.find("#budget").text(budget);
      _addClickEvent();
      _addKeyboardEvent();
  }

  return {
    init: function() {
      $planSequence = $("#plan-sequence");
      cbo.controller.parameter.subscribe(displayRouteList);
      _addKeyboardEvent();
      $planSequence.on("click", '.recalculate', _initRecaculateParameter);
    },
    addAnimationOfRouteList: function(senquenceNumber) {
      _addAnimationOfRouteList(senquenceNumber);
    },
    applyPlanSequenceAnimation: function() {
      _applyPlanSequenceAnimation();
    },
    readPlanSequence: function(readContent) {
      _readPlanSequence(readContent);
    },
    interruptReadPlanSequence: function() {
      _interruptReadPlanSequence();
    }
  };
}();

/**
  * map operation
  */
cbo.controller.map = (function () {
  var locationList,
      locationConfig,
      routeList,
      oMap,
      polylines = [],
      infoBoxes = [],
      markers = {}, //All the markers created from location list
      pointsCollection = {},
      currentMarker,
      recalculateClassName,
      isttsFinished = false,
      isMarkerAnimationFinished = false,
      needAnimation = true, //A flag identifying whether play the animation or not
      markerSequence = [];//Used to store the sequence markers of the route list
      
  var markerTransition = function () {
    var numDeltas = 80,
        delay = 2, //milliseconds
        a, //The marker move distance each time is calculated according to the exprssion "y = a(numDeltas / 2 - |x|)"
        sinVal,
        cosVal,
        moveTimeout,
        callback, //function to call after the transition ends
        _this = this;
        
        var CENTER_OFFSET_X = 60,
            CENTER_OFFSET_Y = -200;
     
    function move(startLat,startLng, i){
      var endLat = startLat + a * (numDeltas/2 - Math.abs(i)) * cosVal,
          endLng = startLng + a * (numDeltas/2 - Math.abs(i)) * sinVal,
          latlng = new google.maps.LatLng(endLat, endLng);
         
      _offsetCenter(latlng);
      if(i <= numDeltas / 2){
         i++;
         moveTimeout = setTimeout(function() {
           move(endLat, endLng, i);
         }, delay);
      } else {
        callback();
      }
    }
    
    function _offsetCenter(latlng) {     
      var scale = Math.pow(2, oMap.getZoom()),
         nw = new google.maps.LatLng(
           oMap.getBounds().getNorthEast().lat(),
           oMap.getBounds().getSouthWest().lng()
         ),
         centerCoordinate = oMap.getProjection().fromLatLngToPoint(latlng),
         pixelOffset = new google.maps.Point((CENTER_OFFSET_X / scale) || 0,(CENTER_OFFSET_Y / scale) ||0);

      var newCenterCoordinate = new google.maps.Point(
            centerCoordinate.x - pixelOffset.x,
            centerCoordinate.y + pixelOffset.y
          ),
          newCenter = oMap.getProjection().fromPointToLatLng(newCenterCoordinate);

      oMap.setCenter(newCenter);
    }
      
    return {
      moveMarker: function (start, end, _callback) {
        callback = _callback;
        var length = Math.sqrt((start.lat() - end.lat()) * (start.lat() - end.lat()) +  (start.lng() - end.lng()) * (start.lng() - end.lng()));
        var sum = 0;
        for (var i = -numDeltas / 2; i < numDeltas/2; i++) {
          sum += numDeltas / 2 - Math.abs(i);
        }
        a = length / sum;
        sinVal = (end.lng() - start.lng()) / length;
        cosVal = (end.lat() - start.lat()) / length;
        move(start.lat(), start.lng(), -numDeltas / 2);
      },
      
      offsetCenter: _offsetCenter,
      
      stopMovement: function () {
        window.clearTimeout(moveTimeout);
      }
    }
  }();
  var ellipse_min = {
        "border":"6px solid #FFB303",
        "border-width" : "13px 13px 15px", 
        "height" : "9px", 
        "margin-left": "138px",
        "margin-top": "56px",
        "width": "13px", 
        "box-shadow": "10px 8px 10px 0px #9F9A8F",
        "-webkit-border-radius": "173px / 79px"
     };
     
  var ellipse_max =  {
        "border":"6px solid #FFB303",
        "border-width" : "26px 70px 48px", 
        "height": "85px", 
        "margin": "0",
        "width": "230px",
        "box-shadow": "10px 8px 10px 0 #9F9A8F",
        "-webkit-border-radius": "173px / 79px"
      };
      
  var ellipse_normal =  {
        "border":"1px solid #FFB303",
        "border-width": "10px 25px 18px 25px",
        "height": "51px",
        "margin-left": "92px",
        "margin-top": "80px",
        "position": "absolute",
        "width": "100px",
        "box-shadow": "8px 7px 10px 0 #9F9A8F",
        "-webkit-border-radius": "140px / 70px"
      };
  
  var polylineCommonStyle = {
        strokeColor: "#FFB303",
        strokeOpacity: 0.9,
        strokeWeight: 10,
        geodesic: true,
        zIndex: 6,
        icons: [{
          icon: { 
            path: 'M -2,0 0,-4 2,0 z',
            fillOpacity: 1,
            strokeColor: '#FFB303'
          },
          offset: '50%'
        }]
      };    
  
  var disabledPolylineStyle = {
        strokeColor: "rgb(163, 161, 161)",
        icons: [{
          icon: { 
            path: 'M -2,0 0,-4 2,0 z',
            fillOpacity: 1,
            strokeColor: 'rgb(163, 161, 161)'
          },
          offset: '50%'
        }]
      };   

  var locationTypeConfig = {
    "Show": "watch",
    "Spot": "visit",
    "Meeting": "attend",
    "Lunch": "have lunch at",
    "Dinner": "have dinner at"    
  };  
  
  var sequenceOrderConfig = {
    "1": "first",
    "2": "second",
    "3": "third",
    "4": "fourth",
    "5": "fifth",
    "6": "sixth",
    "7": "seventh"
  }
  
  //Popup an infoBox on a specified marker
  function popUpinfoBoxOnMarker(marker, isAnimated) {
    var infoBox,
        infoBoxDiv,
        currentNum = marker.get("sequenceNo"),
        infoBoxTemplete,
        currentWidth;
        
    infoBox = createInfoBox();
    infoBoxes[currentNum] = infoBox;
    infoBoxDiv = infoBox.getContent(),       
    infoBoxDiv.setAttribute('id', 'infoBox' + currentNum);
    infoBox.open(oMap, marker);
    marker.set("infoBox", infoBox);
    
    infoBoxTemplete = getInfoboxTemplate(isAnimated, marker);
    infoBoxDiv.innerHTML = infoBoxTemplete;
    
    if (isAnimated) {
      if (!needAnimation) {
        refreshRoute();
        return;
      }

      infoBox.pixelOffset_ = new google.maps.Size(0, calculateInfoBoxOffset(marker, 3));
      $(infoBox.getContent()).fadeTo(500, 1, function () {
        popupInfoBoxCallBack(marker, infoBox);
      });
    } else {
      
      infoBox.pixelOffset_ = new google.maps.Size(0, calculateInfoBoxOffset(marker, 1));
      infoBox.draw();
    }
  }
  
  /**flag has 3 kinds of value: "1" means popup a big infobox on a resized marker, "2" means popup a small infobox 
   * on a resized marker, "3" means popup a big infobox on a normal marker.
  **/  
  function calculateInfoBoxOffset(marker, flag) {
    var frames = marker.get("frames"),
        OFFSET_PIXEL = 1,
        pixelOffsetY; //The offet in vertical direction of the infobox
        
    /** The magic number '198' is the height of the detail popup infowindow(".infoBox .plan-infobox-content").
     * '50' is the height of the small popup infowindow(".infoBox .current-marker-number").
     * '158' is the height of ellipse wrapper div which is definde in the class named "ellipse-wrapper"
     * '85' is the height of the ellipse(ellipse_max)
     * '48' is the border-bottom-width (ellipse_max)
     * '102' is the width of the ellipse(ellipse_normal)
     * '51' is the height of the ellipse(ellipse_normal)
     * '18' is is the border-top-width (ellipse_normal)
    */ 
    if (flag === 1) {
      pixelOffsetY = 0 - (51 / 2 + 18 + (100 / frames.width) * frames.height + 50 + OFFSET_PIXEL);  
    } else if (flag === 2) {
      pixelOffsetY = 0 - (51 / 2 + 18 + (100 / frames.width) * frames.height + 198 + OFFSET_PIXEL);
    } else { 
      pixelOffsetY = 0 - (198 + frames.height + 85 / 2 + 48 + OFFSET_PIXEL);
    }
    
    return pixelOffsetY;
  }
   
  function popupInfoBoxCallBack(marker, infoBox) {
    //cbo.controller.tts.read(["hello world", "sorry, I am sorry"], function () {
      isMarkerAnimationFinished = true;
      if (isttsFinished) {
        ttsSpeakCallBack(marker, infoBox);
      }
  }
  
  function ttsSpeakCallBack(marker, infoBox) {
    var infoBoxTemplete,
        pathList = marker.get("followingPathList"),
        sequenceNo = marker.get("sequenceNo"),
        nextMarker = markerSequence[++sequenceNo],
        infoBoxOffset = calculateInfoBoxOffset(marker, 1);
 
     infoBoxTemplete = getInfoboxTemplate(false, marker);
     
    if (!!nextMarker) {
      if (!needAnimation) {
        refreshRoute();
        return;
      }
      markerTransition.moveMarker(marker.getPosition(), nextMarker.getPosition(), function () {
        drawPolyline(pathList);
        resizeMarkerWithAnimation(marker);
        resizeInfoBoxWithAnimation(marker.get("infoBox"), infoBoxTemplete, infoBoxOffset);
        applyEllipseAnimation(nextMarker);
      });  
    } else {
      resizeMarkerWithAnimation(marker, function () {
        resizeInfoBoxWithAnimation(marker.get("infoBox"), infoBoxTemplete, infoBoxOffset);
        showMarkersOverView();
        needAnimation = false;
      });
      cbo.controller.planSequence.applyPlanSequenceAnimation();
    }
  }
    
  function createInfoBox() {
    var infoBoxDiv = document.createElement("DIV"),
        infoBox_ = new InfoBox({
          content: infoBoxDiv,
          closeBoxURL: ''
        });
    infoBoxDiv.setAttribute('class', 'plan-infoBox');
    return infoBox_;
  }
    
  // add animation over the marker on the map
  function addAnimationOnMarker(marker) {
    if (!needAnimation) {
        refreshRoute();
        return;
      }
    var animation,$canvas,
        canvas = document.createElement("canvas"),
        frames = marker.get("frames"),
        animationOptions = {
          canvas: canvas,
          images: [marker.get('framPicture')],
          frames: frames,
          onAnimationEnd: function () {
            popUpinfoBoxOnMarker(marker, true);
          }
        };
        
    if (!marker) {
      return;
    }
    
    $canvas = $(canvas);   
    $canvas.attr("width",(frames.width + "px")).attr("height",(frames.height + "px"));
    marker.get("ellipse").appendChild(canvas);
    //The magic number is the height(width) of ellipse which is definde in the class named "ellipse-max"
    $canvas.css({'position': 'relative', 'top': (85 / 2 - frames.height) + "px", 'left': (230 - frames.width) / 2 + "px"});
    animation = new Animation(animationOptions);
    marker.set("animation", animation);
    animation.play();
  }
  
  function constructAudioTest(marker) {
    var sequenceNo = parseInt(marker.get("sequenceNo")),
        $planTime = $("#plan-sequence").find("#location"+marker.get("sequenceNo")).closest("dl").prev(".plan-time"),
        fromTime = $planTime.find("img").data("time"),
        toTime = $planTime.data("departure-time"),
        locationType = marker.get("Type"),
        message,
        budget = $("#plan-sequence").find("#location"+marker.get("sequenceNo")).closest("dl").find('dt').data('reminder-cost');
        
    if (null == fromTime) {
      fromTime = $planTime.text();
    }
    if (sequenceNo === 0) {
      message = "At " +  fromTime + ", you'll leave " + marker.get("name"); 
    } else if (sequenceNo === markerSequence.length - 1) {
      message = "At " +  fromTime + ", you'll come back to hotel and finish your fantastic tour";
    } else {
      message = "From " + fromTime + " to " + toTime + ", you'll stay at your " +   sequenceOrderConfig[sequenceNo] + " stop to " + locationTypeConfig[locationType] + " " + marker.get("name") + ". | After you leave, you will have "+ budget + " yuan left.";
    }
    return message;
  }
 
  //Add animation effect on the ellipse
  function applyEllipseAnimation(marker) {
    isMarkerAnimationFinished = false;
    isttsFinished = false;
    var message = constructAudioTest(marker);
    
    if (!needAnimation) {
        refreshRoute();
        return;
      }
     
     cbo.controller.tts.read(message.split("|"), function () {
      console.log("TTS speak end!");
      isttsFinished = true;
      if (isMarkerAnimationFinished) {
        ttsSpeakCallBack(marker, marker.get("infoBox"));
      }
    });
    
      //hard code for the specific requirement
    if (!!!markerSequence[marker.get("sequenceNo") + 1]) {
      markerSequence[0].setMap(null);
      infoBoxes[0].setMap(null);
    }
    
    var ellipse = marker.get("ellipse");
    currentMarker = marker;
    cbo.controller.planSequence.addAnimationOfRouteList(marker.get("sequenceNo"));
    $(ellipse).empty().removeClass().css(ellipse_min);

    $(ellipse).animate(ellipse_max, 500, function() {
      addAnimationOnMarker(marker);
    });
    marker.setMap(oMap);
  }
  
  function formatLocation(oItem) {
  
    var point = {},
        iconLocation,
        currentDisplayMarker;//The marker to display on the map at the moment
    point.id = parseInt(oItem.ID);
    point.name = oItem.Name;
    point.popularity = oItem.popularity;
    point.cost = oItem.Cost;
    point.latlng = new google.maps.LatLng(oItem.PositionX, oItem.PositionY);
    iconLocation = cbo.util.readLocationConfig(locationConfig, oItem.ID);
    if (iconLocation) {
      point.framePicture = cbo.config.iconsPath + iconLocation.FramePicture;
      point.lastFramePicture = cbo.config.iconsPath + iconLocation.LastFramePicture;
      point.frames = iconLocation.Frames;
      point.icon = cbo.config.iconsPath + iconLocation.Icon;
    }
    
    if ((oItem.IsEntrance === "1") || (oItem.IsExit === "1")) {
      point.type = cbo.enum.locationType.ENTRANCE_EXIT;
    } else {
      point.type = cbo.enum.locationType.LOCATION;
    }
    
    return point;
  }

  function initMap() {
    
    var overviewStyles = [
        {
          elementType: 'all',
          featureType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          elementType: 'all',
          featureType: 'landscape',
          stylers: [{ visibility: 'on'}]
        },
        {
          elementType: 'geometry',
          featureType: 'road',
          stylers: [{ visibility: 'on' }]
        },   
        {
          elementType: 'geometry',
          featureType: 'road.arterial',
          stylers: [{ color: '#FFFFFF' }, {lightness: -2}]
        },
        {
          elementType: 'geometry',
          featureType: 'road.highway',
          stylers: [{ visibility: 'off' }]
        },
        {
          elementType: 'geometry',
          featureType: 'road.local',
          stylers: [{ color: '#E2E0DB' }]
        },
        {
          elementType: 'labels',
          featureType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ visibility: 'on' },{ "color": "#8EBACA" }]
        },
        {
         "featureType": "water",
         "elementType": "labels.text.fill",
         "stylers": [{ visibility: 'on' }, { "color": "#F4F3F2" }]
        }
    ];

    var mapoptions = {
      center: new google.maps.LatLng(31.236252, 121.501919),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      minZoom: 8,
      maxZoom: 16,

      streetViewControl: false,
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      zoomControl: false,
      overviewMapControl: false,
      styles: overviewStyles,
      disableDefaultUI: true,
    };
    
    oMap = new google.maps.Map(document.getElementById('map-canvas'), mapoptions);
  }

  function initLocations() {
    var formattedLocation;
    _.each(locationList.value, function (item) {
      formattedLocation = formatLocation(item);
      pointsCollection[formattedLocation.id] = formattedLocation;
    });
    initMarkers();
  }
  //Set point object in the map, including icon title and so on
  function createMarker(oPoint) {
    var locationMarker,
        ellipse = document.createElement("DIV"),
        wrapperDiv = document.createElement("DIV");
        
    if (oPoint == null) {
      return locationMarker;
    }
    $(wrapperDiv).addClass("ellipse-wrapper");
    wrapperDiv.appendChild(ellipse);
    
    locationMarker = new RichMarker({
      position: oPoint.latlng,
      framPicture: [oPoint.framePicture],
      frames: oPoint.frames,
      lastFramePicture: oPoint.lastFramePicture,
      content: wrapperDiv,
      map: oMap,
      anchor: RichMarkerPosition.BOTTOM,
    });   
    
    locationMarker.set("id", oPoint.id);
    locationMarker.set("name", oPoint.name);
    locationMarker.set("ellipse", ellipse);
    return locationMarker;
  }

  function showMarkersOverView() {
    
    _.each(polylines, function (item) {
        item.setOptions({"strokeWeight": 5});
    });
    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds ();
    var markerPosition;
    _.each(markerSequence, function (item) {
      markerPosition = item.getPosition();
       bounds.extend(markerPosition);
    });
    
    oMap.fitBounds (bounds);
  }
  
  //Polyline without animation
  function drawPolyline(pathList, style) {
    var polyline = new google.maps.Polyline(polylineCommonStyle);
    if (!!style) {
      polyline.setOptions(style)
    }
    polyline.setPath(pathList);
    polyline.setMap(oMap);
    polylines.push(polyline);
  }
  
  //Once markers display one by one, init the sequence with a chain
  function initMarkerSequence(routeList) {
    console.log(routeList);
    var locationId, locationMarker;
    for (var i = 0; i < routeList.length; i++) {
	  
      locationId = routeList[i].departureLocation.ID;
      pathList = formateCoordinates(routeList[i].selectedPath.TransportationCoordinate);
      locationMarker = markers[locationId];
      locationMarker.set("followingPathList", pathList);
      locationMarker.set("Type", routeList[i].departureLocation.Type);
      //Used for the small popup infoBox
      locationMarker.set("sequenceNo", i);
      markerSequence.push(locationMarker);
    }
  }
  
  //Formate the transportationCoordinates to the map LatLng
  function formateCoordinates(transportationCoordinate) {
    var pathLatLngList = [];
    if (transportationCoordinate != null) {
      _.each(JSON.parse(transportationCoordinate), function (item) {
        if (item.length > 1) {
          pathLatLngList.push(new google.maps.LatLng(item[0], item[1]));
        }
      });
    }
    return pathLatLngList;
  }
  
  function drawRoutePath(routeList) {
    needAnimation = true;
    recalculateClassName = cbo.config.recalculate ? "recalculated" : "unrecalculated";
    recalculateSequenceNoClassName = cbo.config.recalculate ? "recalculated-no" : "unrecalculated-no";
    initMarkerSequence(routeList);
    if (cbo.config.recalculate) {
      disableMarker(markerSequence[0]);
      disableMarker(markerSequence[1]);
      //disableMarker(markerSequence[2]);
     markerTransition.offsetCenter(markerSequence[2].getPosition());
      console.log("Recalculate the routeList");
      applyEllipseAnimation(markerSequence[2]);
    } else {
      markerTransition.offsetCenter(markerSequence[0].getPosition());
      applyEllipseAnimation(markerSequence[0]);
    }
  };
  
  function getInfoboxTemplate(isDetail, marker) {
    var infoboxTemplate,
        // shoppingCurrentWidth,
        // cultureCurrentWidth,
        // effortCurrentWidth,
        fromTime,
        toTime,
        currentNum =  marker.get("sequenceNo"),
        $planTime = $("#plan-sequence").find("#location"+currentNum).closest("dl").prev(".plan-time"),
        totalNum = $("#plan-sequence").find("li").length - 1;
    if (isDetail) {
      // shoppingCurrentWidth = $closetdl.find('.shopping-star').find(".real-rank").css('width');
      // cultureCurrentWidth = $closetdl.find('.culture-star').find(".real-rank").css('width');
      // effortCurrentWidth = $closetdl.find('.effort-star').find(".real-rank").css('width');
      fromTime = $planTime.find("img").data("time");
      toTime = $planTime.data("departure-time");
      if (null == fromTime) {
        fromTime = $planTime.text();
      }
      
      if (0 === currentNum) {
        infoboxTemplate = _.template(cbo.view.infoBoxStartInnerTemplete, { number: currentNum, title: marker.get("name"), 
                                                                      startTime: fromTime,
                                                                      recalculateClassName: recalculateClassName});
      } else if (totalNum === currentNum) {
        infoboxTemplate = _.template(cbo.view.infoBoxEndInnerTemplete, { number: currentNum, title: marker.get("name"), 
                                                                      endTime: toTime,
                                                                      recalculateClassName: recalculateClassName});
      } else {
        infoboxTemplate = _.template(cbo.view.infoBoxInnerTemplete, {number: currentNum, title: marker.get("name"), 
                                                                  // shoppingCurrentWidth: shoppingCurrentWidth, 
                                                                  // cultureCurrentWidth: cultureCurrentWidth,
                                                                  // effortCurrentWidth: effortCurrentWidth,
                                                                  fromTime: fromTime,
                                                                  toTime: toTime,
                                                                  recalculateClassName: recalculateClassName});
      }
      
    } else {
      infoboxTemplate = _.template(cbo.view.markerSequenceNumberTemplete, {number: currentNum, recalculateSequenceNoClassName: recalculateSequenceNoClassName});
    }
    return infoboxTemplate;
  }
  
  function disableMarker(marker) {
    marker.setMap(oMap);
    pathList = marker.get("followingPathList");
    resizeMarker(marker);
    var content = marker.get("ellipse");
    $(content).css({'border-color': 'rgb(184, 181, 181)'});
	$(content).find('img').css({'opacity': 0.5, '-webkit-filter': 'grayscale(1)'})
    popUpinfoBoxOnMarker(marker, false);
    drawPolyline(pathList, disabledPolylineStyle);
	var infoBox = marker.get("infoBox");
	$(infoBox.getContent()).find('label').css({'color': 'rgb(184, 181, 181)'});
  }
  
  //Init all the markers only once at the first time
  function initMarkers() {
    _.each(pointsCollection, function (value, key) {
      markers[key] = createMarker(value);
    });
  }
  
  //Resize the marker to small size once the marker animation has ended
  function resizeMarker(marker) {
    var content = marker.get('ellipse'),
        $content = $(content),
        frames = marker.get("frames"),
        img = document.createElement("IMG");
    $content.removeAttr("style").removeAttr("class").css(ellipse_normal);
    $content.empty();
    //magic number "100" is the width, "" defined in "ellipse_normal"
    var relativeBottomPixel = (51 / 2) + "px";
    img.src = marker.get("lastFramePicture");
    $(img).css({"position" : "absolute", "bottom" : relativeBottomPixel});
    $content.append(img);
  }
  
  function resizeMarkerWithAnimation(marker, callback) {
    var ellipse = marker.get("ellipse");
	if (callback) {
        callback();
    }
    $(ellipse).find("canvas").fadeTo(1500, 0);
	$(marker.get("ellipse")).animate(ellipse_normal, 1000, function () {
        resizeMarker(marker);
      });
  }
  
  function resizeInfoBoxWithAnimation(infoBox, infoBoxTemplete, offset) {
    var infoBoxTemplete,
        infoBoxDiv = infoBox.getContent();
    $(infoBoxDiv).fadeOut(1000, function () {
      infoBox.pixelOffset_ = new google.maps.Size(0, offset);
      infoBox.draw();
      $(infoBoxDiv).show().empty().html(infoBoxTemplete);
    });
  }
  
  
  //Refresh the markers the polylines behind the currentMarker without animation
  function refreshRoute() {
    var markerTmp, 
        pathList, 
        infoBox,
        sequenceNo = currentMarker.get("sequenceNo");
        
    for (var index = sequenceNo; index < markerSequence.length; index++) {
      markerTmp = markerSequence[index];
      if (!!markerTmp) {
        pathList = markerTmp.get("followingPathList");
        infoBox = markerTmp.get("infoBox");
        resizeMarker(markerTmp);
        markerTmp.setMap(oMap);
        if (!!infoBox) {
          infoBox.setMap(null);
        } 
  
        popUpinfoBoxOnMarker(markerTmp, false);
        drawPolyline(pathList);
      }
    }

    showMarkersOverView();
    google.maps.event.addListenerOnce(oMap, 'bounds_changed', function() {
          //hard code
      markerSequence[0].setMap(null);
      infoBoxes[0].setMap(null);
    });
    cbo.controller.planSequence.applyPlanSequenceAnimation();
  }
  
  function deleteAllPolylines() {
    _.each(polylines, function (item) {
        item.setMap(null);
    });
    polylines = [];
  }
  
  function deleteAllMarkers() {
    _.each(markerSequence, function (item) {
        item.setMap(null);
    });
    markerSequence = [];
  }
  
  function deleteAllInfoBoxes() {
    _.each(infoBoxes, function (item) {
        item.setMap(null);
    });
    infoBoxes = [];
  }
  
  
  //remove all the popup and marker tag and lines
  function cleanMap() {
    deleteAllMarkers();
    deleteAllInfoBoxes();
    deleteAllPolylines();
    oMap.setZoom(15);
  }
  
  /**
  * The animation 
  *@param animationOptions_ options to initialize the animation
  */
  function Animation(animationOptions_) {
     this.animationOptions = animationOptions_;
     var this_ = this;
     this.icon = null;
     this.init = _init;
     //play the animation
     this.play = function () {
       this_.init();
       this_.icon.gotoAndPlay(0);
     }
     //Get the canvas which hold the animation
     this.getCanvas = function () {
       return this_.animationOptions.canvas;
     }
     
     this.pause = function () {
       this_.icon.paused = true;
     }
     
     function _init() {
       var canvas = this.animationOptions.canvas,
           stage = new Stage(canvas),
           spriteSheet = new SpriteSheet({
             images: this.animationOptions.images,
             frames: this.animationOptions.frames
           });
     
       this.icon = new BitmapAnimation(spriteSheet); 
       stage.addChild(this.icon);
       Ticker.setInterval(50);
       Ticker.addListener(stage);
       this.icon.onAnimationEnd = function () {
         this_.animationOptions.onAnimationEnd();
         //Stop at the last frame
         this_.icon.currentFrame = this_.icon.spriteSheet.getNumFrames() - 1;
         this_.icon.paused = true;
       };
     }
   }

  return {
    init: function () {
      initMap();
      //TODO: just test function
      cbo.controller.parameter.subscribe(function(result) {
        routeList = result;
         cleanMap();
      });
    },
    
    getAllLocations: function () {
      return pointsCollection;
    },
    
    /**Resize the infobox according to the flag "isDetail", if the flag is true, it will
     * popup a bigger infoBox which contain the detail infomation, otherwise, it will popup a
     * a small infobox which only contains the sequence number.     
     */
    replaceinfoBox: function (markerSequenceNo, isDetail) {
      var marker,
          infoBox,
          infoDiv,
          currentWidth;
          
          marker = markerSequence[markerSequenceNo];
          if (!!!marker) {
            return;
          }  
        if (!marker.getMap()) {
          console.log("markerSequence.length : " + markerSequence.length);
          console.log("Math.abs(markerSequenceNo - markerSequence.length : " + Math.abs(markerSequenceNo - markerSequence.length));
          markerSequence[Math.abs(markerSequenceNo - markerSequence.length + 1)].setMap(null);
          infoBoxes[Math.abs(markerSequenceNo - markerSequence.length + 1)].setMap(null);
          infoBoxes[markerSequenceNo].setMap(oMap);
          marker.setMap(oMap);
        }
        
        infoBox = marker.get("infoBox");
        infoDiv = infoBox.getContent();
      var infoBoxTemplete = getInfoboxTemplate(isDetail, marker);
      if (isDetail) {
        infoBox.pixelOffset_ = new google.maps.Size(0, calculateInfoBoxOffset(marker, 2));
        infoBox.draw();
        
      } else {
        infoBox.pixelOffset_ = new google.maps.Size(0, calculateInfoBoxOffset(marker, 1));
        infoBox.draw();
      }       
      
      if (!!infoDiv) {
        infoDiv.innerHTML = infoBoxTemplete;
      }
      markerTransition.offsetCenter(marker.getPosition());
    },
    
    initLocations: function(locationSource, config) {
      locationList = locationSource;
      locationConfig = config;
      initLocations();
    },
    
    renderPath: function () {
      drawRoutePath(routeList.output);
    },
    
    stopAnimation: function () {
      
      if (!!!needAnimation) {
        return;
      }
      
      if (!!!currentMarker) {
        return;
      }
      
      var infoBox = currentMarker.get("infoBox"),
          animation = currentMarker.get("animation"),
          ellipse = currentMarker.get("ellipse");
      needAnimation = false;
      //cbo.controller.tts.stop();
      if (!!ellipse) {
        $(ellipse).stop(true, false);
      }
      
      markerTransition.stopMovement();
      if (!!animation) {
        animation.pause();
      }
      if (!!infoBox) {
        $(infoBox.getContent()).stop(true, false);
        $(infoBox.getContent()).empty();
      }
      refreshRoute(); 
    }
  };
})();

cbo.controller.tts = function (){
  function _read(contents, callback) {
    var content = contents.shift();
    
    if (!!!content) {
      $("#show-caption").fadeOut(1000, 0, function() {
        if (!!callback) {
          callback();
        }
      }); 
      return;
    }
    cbo.controller.caption.showCaption(content);
    $("#tts").off("click").on("click", function () {
      _read(contents, callback);
    });
    window.postMessage({ type: "begin-tts", enginee: cbo.config.engineeName, text: content }, "*");
  }
  
  return {
    init: function () {
      $tts = $("#tts");
    },

    read: function (contents, callback) {
      _read(contents, callback);
    },
    
    stop: function () {
      window.postMessage({ type: "stop-tts", text: "" }, "*");
      $("#show-caption").stop(true, false).hide();
    }
  }
}();

cbo.controller.caption = function () {
  function _showCaption(captionContent) {
    $("#show-caption").find(".caption").empty().append(captionContent);
    $("#show-caption").css("display", "table-cell");
  }
  
  return {
    showCaption: function(captionContent) {
      _showCaption(captionContent);
    }
  }
}();
/**
 * Handle the audio
 */
cbo.controller.audioText = function() {
  var textList = {};
  
  function splitText(result) {
    _.each(result, function(value, key) {
      textList[key] = value.split('|');
    });

    //play cover audio, other audio will be played by events
    //cbo.controller.audioText.playAudioByKey('cover');
    
  }
  return {
    init: function() {
      cbo.model.audioText.loadAudioText(function(result) {
        splitText(result);
      });
    },
    playAudioByKey: function(key, callback) {
      cbo.controller.tts.read(_.clone(textList[key]), callback);
    }
  };
}();
