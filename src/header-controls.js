/**
 * Persian Calendar Picker Component
 *
 * Copyright 2016 Reza (github.com/rghorbani)
 * Licensed under the terms of the MIT license. See LICENSE file in the project root for terms.
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { Platform, Text, View , Dimensions, TouchableOpacity} = require('react-native');

const Utils = require('./utils');
const Controls = require('./controls');

function HeaderControls(props) {
  const {
    styles,
    currentMonth,
    currentYear,
    onPressNext,
    onPressPrevious,
    months,
    previousTitle,
    nextTitle,
    textStyle,
    headingLevel,
    handelShowMounth,
    handleShowYear
  } = props;
  const MONTHS = months ? months : Utils.MONTHS; // English Month Array
  // getMonth() call below will return the month number, we will use it as the
  // index for month array in english
  const previous = previousTitle ? previousTitle : 'قبلی';
  const next = nextTitle ? nextTitle : 'بعدی';
  const month = MONTHS[currentMonth];
  const year = currentYear;

  const accessibilityProps = { accessibilityRole: 'header' };
  if (Platform.OS === 'web') {
    accessibilityProps['aria-level'] = headingLevel;
  }

  return (
    <View style={[styles.headerWrapper, {width:Dimensions.get("screen").width*0.9, justifyContent:'space-between'}]}>
      <Controls
        label={previous}
        onPressControl={onPressPrevious}
        styles={[styles.monthSelector, styles.prev]}
        textStyles={textStyle}
      />

      <View style={{flexDirection:'row', }}>
         <TouchableOpacity activeOpacity={1} onPress={()=>handelShowMounth()}>
          <Text style={[styles.monthLabel, textStyle,{width:70}]} {...accessibilityProps}>
            {month} 
          </Text>
        </TouchableOpacity>
        <TouchableOpacity  activeOpacity={1} onPress={()=>handleShowYear()}>
          <Text style={[styles.monthLabel, textStyle,{width:50}]} {...accessibilityProps}>
           {year}
        </Text>
        </TouchableOpacity>
      </View>

      <Controls
        label={next}
        onPressControl={onPressNext}
        styles={[styles.monthSelector, styles.next]}
        textStyles={textStyle}
      />
     
    </View>
  );
}

HeaderControls.propTypes = {
  currentMonth: PropTypes.number,
  currentYear: PropTypes.number,
  onPressNext: PropTypes.func,
  onPressPrevious: PropTypes.func,
};

module.exports = HeaderControls;
