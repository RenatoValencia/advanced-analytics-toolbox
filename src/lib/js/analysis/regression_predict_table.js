define([
  '../chart/line_chart',
  '../util/utils',
  'ng!$q',
], (lineChart, utils, $q) => {
  return {
    /**
     * createCube - create HyperCubes
     *
     * @param {Object} app    reference to app
     * @param {Object} $scope angular $scope
     *
     * @return {Null} null
     */
    createCube(app, $scope) {
      const layout = $scope.layout;
      const dimension = utils.validateDimension(layout.props.dimensions[0]);
      const dimensions = [
        {
          qNullSuppression: true,
          qDef: {
            qFieldDefs: [dimension],
            qSortCriterias: [{
              qSortByExpression: layout.props.dimSort || !layout.props.dimSortByExpression ? 0 : layout.props.dimSortByExpressionAsc,
              qSortByNumeric: (layout.props.dimSort) ? 1 : (!layout.props.dimSortByNum) ? 0 : layout.props.dimSortByNumAsc,
              qSortByAscii: layout.props.dimSort || !layout.props.dimSortByAlph ? 0 : layout.props.dimSortByAlphAsc,
              qExpression: {
                qv: layout.props.dimSortByExpressionString,
              },
            }],
          },
        },
      ];

      const meaLen = layout.props.measures.length;
      $scope.rowsLabel = ['(Intercept)', utils.validateMeasure(layout.props.measures[1])]; // Label for dimension values
      let params = `${utils.validateMeasure(layout.props.measures[0])} as mea0, ${utils.validateMeasure(layout.props.measures[1])} as mea1`;
      let meaList = 'q$mea0 ~ q$mea1';

      for (let i = 2; i < meaLen; i++) {
        const mea = utils.validateMeasure(layout.props.measures[i]);
        if (mea.length > 0) {
          const param = `,${mea} as mea${i}`;
          params += param;
          meaList += ` + q$mea${i}`;

          $scope.rowsLabel.push(utils.validateMeasure(layout.props.measures[i]));
        } 
      }
	  
	  // Normalize data - Find Correlation - Split condition - set training data for fit model and predict only NA values, using most correlated features.  
	  const soglia = 0.3;
	  const norm = `library(caret);target <- q$mea0; preParams <- preProcess(q[,1:${meaLen}], method=c("range"));q <- predict(preParams, q[,1:${meaLen}]); q$mea0 <- target`;
	  const cor = `m = abs(cor(subset(q,q$mea0 != 0),q$mea0[q$mea0 != 0], method = "pearson"))`;
	  const fo = `f="";for(j in 2:${meaLen}) if(!is.na(m[j]) && m[j]>=${soglia}){l=paste("q$mea",j-1,sep=""); f=paste(f,l,sep=" + ")} ;f=paste("q$mea0 ~ ",substring(f,3));str(f)`;  
	  const split = `q$mea0 > 0`;	
	  const s = `q = subset(q,q$mea0 == 0); q$mea0[q$mea0 == 0] <- NA;`;
	  
      // Debug mode - set R dataset name to store the q data.
      utils.displayDebugModeMessage(layout.props.debugMode);
      const saveRDataset = utils.getDebugSaveDatasetScript(layout.props.debugMode, 'debug_regression_analysis_line_chart.rda');
		  
      const defMea1 = `R.ScriptEval('${saveRDataset} ${norm}; if(sum(q$mea0)> 0 && min(q$mea0) == 0){${cor}; ${fo}; lm_result <- lm(as.formula(f), q, ${split});${s} predict(lm_result, q, interval="${layout.props.interval}", level=${layout.props.confidenceLevel});} else{lm_result <- lm(${meaList});predict(lm_result, interval="${layout.props.interval}", level=${layout.props.confidenceLevel}); }[,1]',${params})`;
      const defMea2 = `R.ScriptEval('${norm}; if(sum(q$mea0)> 0 && min(q$mea0) == 0){${cor}; ${fo}; lm_result <- lm(as.formula(f), q, ${split});${s} predict(lm_result, q, interval="${layout.props.interval}", level=${layout.props.confidenceLevel});} else{lm_result <- lm(${meaList});predict(lm_result, interval="${layout.props.interval}", level=${layout.props.confidenceLevel}); }[,2]',${params})`;
      const defMea3 = `R.ScriptEval('${norm}; if(sum(q$mea0)> 0 && min(q$mea0) == 0){${cor}; ${fo}; lm_result <- lm(as.formula(f), q, ${split});${s} predict(lm_result, q, interval="${layout.props.interval}", level=${layout.props.confidenceLevel});} else{lm_result <- lm(${meaList});predict(lm_result, interval="${layout.props.interval}", level=${layout.props.confidenceLevel}); }[,3]',${params})`;

      // Debug mode - display R Scripts to console
      utils.displayRScriptsToConsole(layout.props.debugMode, [defMea1, defMea2, defMea3]);

      const measure = utils.validateMeasure(layout.props.measures[0]);
      const measures = [
        {
          qDef: {
            qDef: measure,
          },
        },
        {
          qDef: {
            qDef: defMea1,
          },
        },
        {
          qDef: {
            qDef: defMea2,
          },
        },
        {
          qDef: {
            qDef: defMea3,
          },
        },
        {
          qDef: {
            qLabel: '-',
            qDef: '', // Dummy
          },
        },
      ];

      $scope.backendApi.applyPatches([
        {
          qPath: '/qHyperCubeDef/qDimensions',
          qOp: 'replace',
          qValue: JSON.stringify(dimensions),
        },
        {
          qPath: '/qHyperCubeDef/qMeasures',
          qOp: 'replace',
          qValue: JSON.stringify(measures),
        },
      ], false);

      $scope.patchApplied = true;
      return null;
    },
    /**
    * drawChart - draw chart with updated data
    *
    * @param {Object} $scope angular $scope
    *
    * @return {Object} Promise object
    */
    drawChart($scope, app) {
      const defer = $q.defer();
      const layout = $scope.layout;

      const requestPage = [{
        qTop: 0,
        qLeft: 0,
        qWidth: 6,
        qHeight: 1500,
      }];

      $scope.backendApi.getData(requestPage).then((dataPages) => {
        const measureInfo = $scope.layout.qHyperCube.qMeasureInfo;

        // Display error when all measures' grand total return NaN.
        if (isNaN(measureInfo[1].qMin) && isNaN(measureInfo[1].qMax)
          && isNaN(measureInfo[2].qMin) && isNaN(measureInfo[2].qMax)
          && isNaN(measureInfo[3].qMin) && isNaN(measureInfo[3].qMax)
        ) {
          utils.displayConnectionError($scope.extId);
        } else {
          // Debug mode - display returned dataset to console
          utils.displayReturnedDatasetToConsole(layout.props.debugMode, dataPages[0]);
	    
          const palette = utils.getDefaultPaletteColor();
          const elemNum = [];
          const dim1 = []; // Dimension
          const mea1 = [];
          const mea2 = [];
          const mea3 = [];
          const mea4 = [];
		  
		  
          $.each(dataPages[0].qMatrix, (key, value) => {  
            elemNum.push(value[0].qElemNumber);
		    if(value[1].qNum == 0)  
            dim1.push(value[0].qText);		
            mea1.push(value[1].qNum);
            mea2.push(value[2].qNum);
            mea3.push(value[3].qNum);
            mea4.push(value[4].qNum);
		  });

		  
          // Set table header
          let html = `
            <h2>Predicted:</h2>
            <table class="simple">
              <thead>
                <tr>
                  <th>Code</th><th>Remaining Life</th>
                </tr>
              </thead>
              <tbody>
          `;
		  
		  // Set regression analysis results to table
          for (let i = 0; i < dim1.length; i++) {
            html += `<tr><td>${dim1[i]}</td><td>${Math.ceil(mea2[i])}</td>
                    </tr>`;
          }

          // Set table footer and other results
          html += `
              </tbody>
            </table>
		   `;
		  
	 	  // Set HTML element for chart
          $(`.advanced-analytics-toolsets-${$scope.extId}`).html(html); 
		  
        }
        return defer.resolve();
      });
      return defer.promise;
    },
  };
});
