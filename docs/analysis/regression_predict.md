# Regression Analysis with prediction
Plots on a histogram a prediction of multiple linear regression model.

## Screenshot
  ![regression analysis prediction](./images/m_reg_pred.png)

## Prerequisite R packages
 * caret

## Used R command
 * [lm](https://www.rdocumentation.org/packages/stats/versions/3.4.0/topics/lm)
 * [predict](https://www.rdocumentation.org/packages/stats/versions/3.4.0/topics/predict)
 * [preProcess](https://www.rdocumentation.org/packages/caret/versions/6.0-78/topics/preProcess)
 * [cor](https://www.rdocumentation.org/packages/stats/versions/3.4.3/topics/cor)

## Caution
  * Histogram show only the prediction values on a Test Set elements.
  * Use only Training Set (where Response variable have some value) to fit the model.
  * Data are normalized (exclude the Response variable).
  * Model is based on Predictor variables with a certain degree of correlation (>= |0.3|).
  
## Usage
  1. Place [Advanced Analytics Toolbox] extension on a sheet and select [Multiple linear regression analysis] > [Multiple regression prediction] for [Analysis Type]
  2. Select dimensions and measures
    * Dimension: A field uniquely identifies each record (ex: ID, Code)
    * Measure 1: Response variable
    * Measure 2-: Predictor variables

## Options
  * Confidence level - Tolerance/confidence level.

