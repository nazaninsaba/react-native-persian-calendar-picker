/**
 * Persian Calendar Picker Component
 *
 * Copyright 2016 Reza (github.com/rghorbani)
 * Licensed under the terms of the MIT license. See LICENSE file in the project root for terms.
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { Text, TouchableOpacity } = require('react-native');
import Icon from 'react-native-vector-icons/Feather'

function Controls({ styles, textStyles, label, onPressControl }) {
  return (
    <TouchableOpacity activeOpacity={1} onPress={() => onPressControl()} style={{flexDirection:'row', alignItems:'center'}}>
      {label=="قبلی"? <Icon name="chevron-right" size={20} style={{marginTop:-7, marginRight:5}} color={"#515763"}/>:null}
      <Text style={[styles, textStyles,{color:'#9c9fa6'}]}>{label}</Text>
     {label=="بعدی"? <Icon name="chevron-left" size={20} style={{marginTop:-7, marginLeft:5}} color={"#515763"}/>:null}
    </TouchableOpacity>
  );
}

Controls.propTypes = {
  styles: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  onPressControl: PropTypes.func.isRequired,
};

module.exports = Controls;
