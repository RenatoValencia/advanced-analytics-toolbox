"use strict";define(["../chart/line_chart","../util/utils","ng!$q"],function(e,r,s){return{createCube:function(e,s){var a=s.layout,t=r.validateDimension(a.props.dimensions[0]),p=[{qNullSuppression:!0,qDef:{qFieldDefs:[t],qSortCriterias:[{qSortByExpression:a.props.dimSort||!a.props.dimSortByExpression?0:a.props.dimSortByExpressionAsc,qSortByNumeric:a.props.dimSort?1:a.props.dimSortByNum?a.props.dimSortByNumAsc:0,qSortByAscii:a.props.dimSort||!a.props.dimSortByAlph?0:a.props.dimSortByAlphAsc,qExpression:{qv:a.props.dimSortByExpressionString}}]}}],l=a.props.measures.length;s.rowsLabel=["(Intercept)",r.validateMeasure(a.props.measures[1])];for(var i=r.validateMeasure(a.props.measures[0])+" as mea0, "+r.validateMeasure(a.props.measures[1])+" as mea1",o="q$mea0 ~ q$mea1",n=2;n<l;n++){var m=r.validateMeasure(a.props.measures[n]);if(m.length>0){var u=","+m+" as mea"+n;i+=u,o+=" + q$mea"+n,s.rowsLabel.push(r.validateMeasure(a.props.measures[n]))}}var q=.3,d="library(caret);target <- q$mea0; preParams <- preProcess(q[,1:"+l+'], method=c("range"));q <- predict(preParams, q[,1:'+l+"]); q$mea0 <- target",c='m = abs(cor(subset(q,q$mea0 != 0),q$mea0[q$mea0 != 0], method = "pearson"))',f='f="";for(j in 2:'+l+") if(!is.na(m[j]) && m[j]>="+q+'){l=paste("q$mea",j-1,sep=""); f=paste(f,l,sep=" + ")} ;f=paste("q$mea0 ~ ",substring(f,3));str(f)',v="q$mea0 > 0",h="q = subset(q,q$mea0 == 0); q$mea0[q$mea0 == 0] <- NA;";r.displayDebugModeMessage(a.props.debugMode);var y=r.getDebugSaveDatasetScript(a.props.debugMode,"debug_regression_analysis_line_chart.rda"),b="R.ScriptEval('"+y+" "+d+"; if(sum(q$mea0)> 0 && min(q$mea0) == 0){"+c+"; "+f+"; lm_result <- lm(as.formula(f), q, "+v+");"+h+' predict(lm_result, q, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+");} else{lm_result <- lm("+o+');predict(lm_result, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+"); }[,1]',"+i+")",g="R.ScriptEval('"+d+"; if(sum(q$mea0)> 0 && min(q$mea0) == 0){"+c+"; "+f+"; lm_result <- lm(as.formula(f), q, "+v+");"+h+' predict(lm_result, q, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+");} else{lm_result <- lm("+o+');predict(lm_result, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+"); }[,2]',"+i+")",N="R.ScriptEval('"+d+"; if(sum(q$mea0)> 0 && min(q$mea0) == 0){"+c+"; "+f+"; lm_result <- lm(as.formula(f), q, "+v+");"+h+' predict(lm_result, q, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+");} else{lm_result <- lm("+o+');predict(lm_result, interval="'+a.props.interval+'", level='+a.props.confidenceLevel+"); }[,3]',"+i+")";r.displayRScriptsToConsole(a.props.debugMode,[b,g,N]);var S=r.validateMeasure(a.props.measures[0]),$=[{qDef:{qDef:S}},{qDef:{qDef:b}},{qDef:{qDef:g}},{qDef:{qDef:N}},{qDef:{qLabel:"-",qDef:""}}];return s.backendApi.applyPatches([{qPath:"/qHyperCubeDef/qDimensions",qOp:"replace",qValue:JSON.stringify(p)},{qPath:"/qHyperCubeDef/qMeasures",qOp:"replace",qValue:JSON.stringify($)}],!1),s.patchApplied=!0,null},drawChart:function(e,a){var t=s.defer(),p=e.layout,l=[{qTop:0,qLeft:0,qWidth:6,qHeight:1500}];return e.backendApi.getData(l).then(function(s){var a=e.layout.qHyperCube.qMeasureInfo;if(isNaN(a[1].qMin)&&isNaN(a[1].qMax)&&isNaN(a[2].qMin)&&isNaN(a[2].qMax)&&isNaN(a[3].qMin)&&isNaN(a[3].qMax))r.displayConnectionError(e.extId);else{r.displayReturnedDatasetToConsole(p.props.debugMode,s[0]);var l=(r.getDefaultPaletteColor(),[]),i=[],o=[],n=[],m=[],u=[];$.each(s[0].qMatrix,function(e,r){l.push(r[0].qElemNumber),0==r[1].qNum&&i.push(r[0].qText),o.push(r[1].qNum),n.push(r[2].qNum),m.push(r[3].qNum),u.push(r[4].qNum)});for(var q='\n            <h2>Predicted:</h2>\n            <table class="simple">\n              <thead>\n                <tr>\n                  <th>Code</th><th>Remaining Life</th>\n                </tr>\n              </thead>\n              <tbody>\n          ',d=0;d<i.length;d++)q+="<tr><td>"+i[d]+"</td><td>"+Math.ceil(n[d])+"</td>\n                    </tr>";q+="\n              </tbody>\n            </table>\n\t\t   ",$(".advanced-analytics-toolsets-"+e.extId).html(q)}return t.resolve()}),t.promise}}});
//# sourceMappingURL=../../maps/analysis/regression_predict_table.js.map
