/**
 * view.js， All the templates should be here.
 */
cbo.view = cbo.view || {};
    
cbo.view.planSequenceTemplete = '<ul><%_.each(spotNames,  function(outputList, key){%>'+
                                    '<li class="plan-sequence-item"><label data-departure-time=<%= outputList.departureTime %> class="plan-time" data-time-cost=<%= outputList.selectedPath.TimeCost %>></label>'+
                                    '<dl><dt data-cost=<%= outputList.departureLocation.TicketCost %> data-sid=<%= key %> data-nid=<%= outputList.departureLocation.ID %> class="plan-location" id=location<%= key %>>'+
                                    '<%= outputList.departureLocation.Name %></dt>'+
                                    
                                    // '<% if (undefined !== outputList.departureLocation.Shopping) {%>'+
                                    // '<dt class="shopping-star star-count"><span class="star-title">Shopping</span>'+
                                    // '<em data-rank=<%= (outputList.departureLocation.Shopping) %> class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '<em class="real-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '</dt>'+
                                    // '<% } %>'+
                                    
                                    // '<% if (undefined !== outputList.departureLocation.Culture) {%>'+
                                    // '<dt class="culture-star star-count"><span class="star-title">Culture</span>'+
                                    // '<em data-rank=<%= (outputList.departureLocation.Culture) %> class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '<em class="real-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '</dt>'+
                                    // '<% } %>'+
                                    
                                    // '<% if (undefined !== outputList.departureLocation.Energy) {%>'+
                                    // '<dt class="effort-star star-count"><span class="star-title">Energy</span>'+
                                    // '<em data-rank=<%= (outputList.departureLocation.Energy) %> class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '<em class="real-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                    // '</dt>'+
                                    // '<% } %>'+
                                    
                                    '<dd><%= outputList.selectedPath.TransportationDetail %></dd>'+
                                    '<dd>Time:<span><%= outputList.selectedPath.TimeCost %></span></dd>'+
                                    '<dd>Cost:<span class="path-cost"><%= outputList.selectedPath.MoneyCost %></span></dd>'+
                                    '</dl><button class="recalculate">Recalculate</button></li><%});%>'+
                                  '</ul>'+
                                  '<button id="return-config-btn" class="submit-btn">Return</button>'+
                                  '<button id="stop-animation-btn" class="submit-btn">Stop</button>';

cbo.view.planSequenceStartFlag = '<img src="css/images/icon_flag.png" data-time= <%= time %> >';

cbo.view.infoBoxInnerTemplete = '<div class="plan-infobox-content <%= recalculateClassName %>"><div class="plan-flag"><span class="number"><%= number %></span><img src="css/images/icon_flag_big.png" /></div>'+
                                '<div class="plan-message">'+
                                  '<div class="plan-title"><%= title %></div>'+
                                  
                                  // '<div class="plan-detail"><span class="star-title">Shopping</span>'+
                                  // '<div class="shopping-star star-count">'+
                                  // '<em class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '<em class="real-rank" style="width: <%= shoppingCurrentWidth %>"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '</div>'+
                                  // '</div>'+
                                  
                                  // '<div class="plan-detail"><span class="star-title">Culture</span>'+
                                  // '<div class="culture-star star-count">'+
                                  // '<em class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '<em class="real-rank" style="width: <%= cultureCurrentWidth %>"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '</div>'+
                                  // '</div>'+
                                  
                                  // '<div class="plan-detail"><span class="star-title">Energy</span>'+
                                  // '<div class="culture-star star-count">'+
                                  // '<em class="total-rank"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '<em class="real-rank" style="width: <%= effortCurrentWidth %>"><span class="first"></span><span></span><span></span><span></span><span></span></em>'+
                                  // '</div>'+
                                  // '</div>'+
                                  
                                  '<div class="plan-detail"><div><span class="from-time-title time-title">From:</span>'+
                                    '<span class="from-time"><%= fromTime %></span></div>'+
                                    '<div><span class="to-time-title time-title">To:</span>'+
                                    '<span class="to-time"><%= toTime %></span></div>'+
                                  '</div>'+
                                  
                                '</div></div>';
                                
                                
cbo.view.infoBoxStartInnerTemplete = '<div class="plan-infobox-content <%= recalculateClassName %>"><div class="plan-flag"><span class="number"><%= number %></span><img src="css/images/icon_flag_big.png" /></div>'+
                                        '<div class="plan-message">'+
                                          '<div class="plan-title"><%= title %></div>'+
                                          
                                          '<div class="plan-detail">'+
                                            '<div class="start-end"><span class="from-time-title time-title">Start:</span>'+
                                            '<span class="from-time"><%= startTime %></span></div>'+
                                          '</div>'+
                                        '</div></div>';
                                        
cbo.view.infoBoxEndInnerTemplete = '<div class="plan-infobox-content <%= recalculateClassName %>"><div class="plan-flag"><span class="number"><%= number %></span><img src="css/images/icon_flag_big.png" /></div>'+
                                        '<div class="plan-message">'+
                                          '<div class="plan-title"><%= title %></div>'+
                                          
                                          '<div class="plan-detail">'+
                                            '<div class="start-end"><span class="to-time-title time-title">End:</span>'+
                                            '<span class="to-time"><%= endTime %></span></div>'+
                                          '</div>'+
                                        '</div></div>'

cbo.view.markerSequenceNumberTemplete = '<div class="current-marker-number <%= recalculateSequenceNoClassName %>"><label><%= number %></label><img src="css/images/icon_flag.png" /></div>';

cbo.view.budgetShowTemplete = '<canvas id="start-time-show-drawing"  width="150" height="150"> Your browser does not support the canvas element.</canvas>'+
                              '<p id="time"><%= startTime %></p><p id="budget"><%= remainderBudget %></p>';
                                  
cbo.view.hardConstraintTemplate ='<ul id="hard-parameters-ul">' +
                                    '<% _.each(hardParametersId, function(hardParameterId) {%>' +
                                      '<% var parameterEndId = hardParameters[hardParameterId].endId; %>' +
                                      '<% var parameterWill = hardParameters[hardParameterId].will; %>' +
                                      '<% var parameterEnabled = hardParameters[hardParameterId].enabled; %>' +
                                      '<% if(parameterEnabled === "yes") { %>' +
                                        '<% if(!!parameterEndId) { %>' +
                                        '<% if(parameterWill === "yes") { %>' +
                                          '<li draggable="true" class="liEnabled" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } else if(parameterWill === "no") { %>' +
                                          '<li draggable="true" class="liEnabled" data-will="no" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } else {%>' +
                                          '<li draggable="true" class="liEnabled" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } %>' +
                                        '<% } else { %>' +
                                          '<% if(parameterWill === "yes") { %>' +
                                            '<li draggable="true" class="liEnabled" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% } else if(parameterWill === "no") { %>' +
                                            '<li draggable="true" class="liEnabled" data-will="no" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% } else {%>' +
                                            '<li draggable="true" class="liEnabled" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% }%>' +
                                        '<% } %>' +
                                      '<% } else { %>' +
                                        '<% if(!!parameterEndId) { %>' +
                                        '<% if(parameterWill === "yes") { %>' +
                                          '<li draggable="true" class="liParam" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } else if(parameterWill === "no") { %>' +
                                          '<li draggable="true" class="liParam" data-will="no" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } else {%>' +
                                          '<li draggable="true" class="liParam" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%> data-endid=<%= parameterEndId%>>' +
                                        '<% } %>' +
                                        '<% } else { %>' +
                                          '<% if(parameterWill === "yes") { %>' +
                                            '<li draggable="true" class="liParam" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% } else if(parameterWill === "no") { %>' +
                                            '<li draggable="true" class="liParam" data-will="no" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% } else {%>' +
                                            '<li draggable="true" class="liParam" data-will="yes" data-id=<%= hardParameters[hardParameterId].id%>>' +
                                          '<% }%>' +
                                        '<% } %>' +
                                      '<% } %>' +
                                        '<a class="icon-img" href="#"></a>' +
                                        '<div class="liDiv">' +
                                          '<% if(hardParameters[hardParameterId].icon === "spot") { %>' +
                                            '<span class=<%= hardParameters[hardParameterId].icon%> data-url=<%= hardParameters[hardParameterId].iconUrl%> ></span>' +
                                          '<% } else {%>' +
                                            '<span class=<%= hardParameters[hardParameterId].icon%> ></span>' +
                                          '<% } %>' +
                                          '<label><%= hardParameters[hardParameterId].name%></label>' +
                                        '</div>' +
                                      '</li>' +
                                    '<% });%>' +
                                  '</ul>';

cbo.view.softConstraintTemplate = '<ul id="soft-parameters-ul"></ul>';

cbo.view.parameterNavTemplate = '<section id="add-constraint-list">' +
                                  '<h2>Add Constraints</h2>'+
                                  '<ul class="parameter-nav-list">'+
                                    '<li id="meeting-nav" class="big-nav"><span class="nav-meeting-img big-nav-img"/><h3 class="nav-name">Meeting</h3></li>'+
                                    '<li id="spot-nav" class="big-nav"><span class="nav-spot-img big-nav-img"/><h3 class="nav-name">Spot</h3></li>'+
                                    '<li id="food-nav" class="big-nav"><span class="nav-food-img big-nav-img"/><h3 class="nav-name">Food</h3></li>'+
                                    '<li id="show-nav" class="big-nav"><span class="nav-show-img big-nav-img"/><h3 class="nav-name">Show</h3></li>'+
                                    '<li id="hotel-nav" class="little-nav selected"><span class="nav-hotel-img little-nav-img"/><h3 class="nav-name">Hotel</h3></li>'+
                                    '<li id="budget-nav" class="little-nav"><span class="nav-budget-img little-nav-img"/><h3 class="nav-name">Budget</h3></li>'+
                                    '<li id="time-nav" class="little-nav"><span class="nav-time-img little-nav-img"/><h3 class="nav-name">Time</h3></li>'+
                                    '<li class="hotel-unable-selected unable-selected"></li>'+
                                    '<li class="budget-unable-selected unable-selected"></li>'+
                                    '<li class="time-unable-selected unable-selected"></li>'+
                                    '<li id="cost-value" class="cost-value-style">' +
                                      '<p class="cost-description"><span>Cost:</span><span id="cost-value-span">285</span></p>' +
                                      '<p><span id="cost-progress-bar"></span></p>' +
                                    '</li>' +
                                  '</ul>'+
                                '</section>' +
                                '<button id="parameter-optimization" class="submit-btn">Optimize</button>';

cbo.view.popupBlanket = '<div id="qtip-blanket"></div>';

cbo.view.popupWithoutCloseTemplate = '<div class="popup"></div>';

cbo.view.meetingListTemplate = '<div id="meeting-welcome">'+
                               '<p class="outlook-hello">From your Outlook Calendar, you\'ll visit Shanghai from'+
                               '<span class="outlook-data"><%= startDate%></span> to'+
                               '<span class="outlook-data"><%= endDate%></span></p>'+
                               '<p class="outlook-hello">The booked meetings of these days are as follows:</p></div>'+
                               '<div id="meeting-data"><% _.each(outlook, function(item, key) {%>'+
                               '<div class="unchecked-meeting all-meetings" id=meeting-<%= item.id%>><div class="meeting-subject"><h3><%= item.subject%></h3></div>'+
                               '<span class="left-date"><span class="month-date"><%= getMonthByDate(item.date)%></span>'+
                               '<span class="day-date"><%= getDayByDate(item.date)%></span></span>'+
                               '<span class="right-time"><span class="start-time"><%= item.startTime%></span>'+
                               '<span class="time-cutoff"></span><span class="end-time"><%= item.endTime%></span></span></div><% });%></div>'+
                               '<button id="meeting-ok" class="popup-ok">OK</button>'+
                               '<button id="metting-cancel" class="popup-cancel">Cancel</button>';

cbo.view.spotListTemplate = '<div class="outer-frame"><button id="spot-ok" class="popup-ok">OK</button>'+
                             '<button id="spot-cancel" class="popup-cancel">Cancel</button>'+
                             '</div>';

cbo.view.spotListItemsTemplate = '<% _.each(spotList, function(item) {%>'+
                                  '<span id=spot-<%= item.ID%> class="default-spot unchecked-spot"><span class="spot-checkbox"></span></span>'+
                                 '<% });%>';

cbo.view.foodListTemplate = '<div class="outer-frame">' + 
                              '<h2 class="popup-title">MENU</h2>' +
                              '<div class="inner-content clearfix"></div>' +
                              '<div class="food-button"><button id="food-ok" class="popup-ok">OK</button>'+
                              '<button id="food-cancel" class="popup-cancel">Cancel</button></div>'+
                            '</div>';

cbo.view.foodListItemsTemplate = '<ul class="food-cloumn"><% _.each(data, function(food) {%>' +
                                  '<li class="signal-food">'+
                                    '<h3><%= food.name%></h3>'+
                                    '<ul><% _.each(food.restaurant, function(item) {%>' +
                                      '<li id=food-<%= item.id%> class="default-food-li unchecked-food default-food">' +
                                        '<span class="food-checkbox"></span>'+
                                        '<span class="food-info">' +
                                          '<span class="food-name"><%= item.name%></span>' +
                                          '<span class="food-rank" data-rank=<%= item.rank%>>'+
                                          '<span></span><span></span><span></span><span></span><span></span>'+
                                          '</span><span class="real-rank">'+
                                          '<span></span><span></span><span></span><span></span><span></span></span>'+
                                        '</span>' +
                                      '</li><% });%>' +
                                    '</ul>'+
                                  '</li><% });%></ul>';

cbo.view.showListTemplate = '<div class="outer-frame"><div class="inner-content"></div>'+
                            '<button id="show-ok" class="popup-ok">OK</button>'+
                            '<button id="show-cancel" class="popup-cancel">Cancel</button>'+
                            '</div>';

cbo.view.showListItemsTemplate = '<ul><% _.each(data, function(item) {%>'+
                                  '<li id=show-<%= item.id%> class="unchecked-show default-show">'+
                                    '<p class="show-info-column">' +
                                      '<span class="show-checkbox"></span>'+
                                      '<span class="show-title"><%= item.name%></span>'+
                                      '<span class="separator-line"></span>'+
                                      '<span class="show-price-block"><span class="show-price"><%= item.price%></span>'+
                                      '<span class="show-price-unit">RMB</span></span>'+
                                    '</p>' +
                                    '<p class="show-time-column">' +
                                      '<label class="showlist-time-tag">时间：</label>'+
                                      '<span class="showlist-date"><%= currentDate%></span><span class="showlist-time"><%= item.time%></span>'+
                                    '</p>' +
                                    '<p class="show-location-column">' +
                                      '<label class="showlist-address-tag">地点：</label>'+
                                      '<span class="showlist-address"><%= item.address%></span>'+
                                    '</p>' +
                                  '</li><% });%>'+
                                '</ul>';

cbo.view.hotelListTemplate = '<div class="outer-frame"><h2 class="popup-title">SAP Contract Hotels</h2><p class="city-name">Shanghai</p>'+
                             '<div class="inner-content"></div>'+
                             '<button id="hotel-ok" class="popup-ok">OK</button>'+
                             '<button id="hotel-cancel" class="popup-cancel">Cancel</button>'+
                             '</div>';
                             
cbo.view.hotelOneColumnListTemplate = '<ul><%_.each(data, function(item){%>'+
                                        '<% if (item.endId !== undefined) { %>'+
                                        '<li data-nid=<%= item.id %> id=hotel-<%= item.id %> class="hotel-message">'+
                                        '<div class="hotel-discription"><p class="address"><%= item.name %></p>'+
                                        '<p class="hotel-detail"><label><%= item.address %></label>'+
                                        '<label class="tel"><%= item.tel %></label></p></div>'+
                                        '<div class="hotel-price"><span class="price"><%= item.price %></span><span class="price-unit">CNY</span><div>'+
                                        '</li>'+
                                        '<% } %>'+
                                        '<%});%>'+
                                      '</ul>';

cbo.view.parameterBudgetTemplate = '<h2 class="popup-title">Budget</h2>'+
                                   '<div id="budget-content"><label class="budget-value-tag">Total:</label><span class="budget-value"><%= budget%></span>'+
                                   '<span class="budget-unit">RMB</span>'+
                                   '<div id="budget-slider"></div>'+
                                   '<button id="budget-ok" class="popup-ok">OK</button>'+
                                   '<button id="budget-cancel" class="popup-cancel">Cancel</button></div>';

cbo.view.budgetLegendTemplate = '<div id="ui-slider-legend"><% _.each(legendArray, function(item) {%>'+
                                  '<p style="width:'+'<%= legendWidth%>'+'px;"><%= item%></p>'+
                                '<% });%></div>';

cbo.view.chooseTimePopupTemplate = '<div class="time clearfix"><div id="start-time"><div class="choose-start-time"><h3 class="show-hint">Start time</h3>'+
                                   '<div class="start-choose clearfix"><div id="start-hour" class="time-dropdown hour-dropdown"></div><div class="colon">:</div><div id="start-min" class="time-dropdown min-dropdown"></div></div></div>'+
                                   '<div class="show-start-time"><canvas id="start-time-drawing"  width="200" height="200"> Your browser does not support the canvas element.</canvas></div></div>'+
                                   '<div id="end-time"><div class="choose-end-time"><h3 class="show-hint">End time</h3>'+
                                   '<div class="end-choose clearfix"><div id="end-hour" class="time-dropdown hour-dropdown"></div><div class="colon">:</div><div id="end-min" class="time-dropdown min-dropdown"></div></div></div>'+
                                   '<div class="show-end-time"><canvas id="end-time-drawing"  width="200" height="200"> Your browser does not support the canvas element.</canvas></div></div>'+
                                   '</div><div><button id="time-ok" class="popup-ok">OK</button><button id="time-cancel" class="popup-cancel">Cancel</button></div>';
                                
cbo.view.dropDownTemplete =   '<select name="<%=selectName %>" id="<%= selectIdName %>">'+
                              '<%_.each(showObject, function (value, key) {%>'+
                                '<option value = "<%= key %>"><%= value %></option>'+
                              '<%});%>'+
                              '</select>';

cbo.view.weightValueTemplate = '<div class="weight-outer-frame"><h2>Optimization Objectives</label><label class="weight-cutoff"></h2>'+
                               '<article id="weight-chart"></article>' + 
                               '<button id="weight-cancel" class="popup-cancel cancel">Cancel</button>'+
                               '<button id="weight-ok" class="popup-ok submit">Let\'s go!</button>'+'</div>'+
                               
                               '<div class="outer-frame">'+
                               '<div class="inner-content"><div class="no-solution-message"><p>Dear, it\'s not possible!</p><p class="question-text">May I adjust the constraints for you?</p></div><div class="people"></div></div>'+
                               '<div id="operate-buttons"><button id="no-solution-ok" class="popup-ok submit">YES</button>'+
                               '<button id="no-solution-cancel" class="popup-cancel cancel">NO</button></div>'+
                               '</div>';
