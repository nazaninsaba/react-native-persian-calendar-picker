/**
 * Persian Calendar Picker Component
 *
 * Copyright 2016 Reza (github.com/rghorbani)
 * Licensed under the terms of the MIT license. See LICENSE file in the project root for terms.
 */

'use strict';

const React = require('react');
const jMoment = require('moment-jalaali');
const { Dimensions, View,Text , TouchableOpacity, } = require('react-native');
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const DaysGridView = require('./days-grid');
const HeaderControls = require('./header-controls');
const Weekdays = require('./weekdays');
const Swiper = require('./swiper');
const Utils = require('./utils');
const makeStyles = require('./style');

const SWIPE_LEFT = 'SWIPE_LEFT';
const SWIPE_RIGHT = 'SWIPE_RIGHT';

const _swipeConfig = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
};

class PersianCalendarPicker extends React.Component {
  static defaultProps = {
    isRTL: false,
    initialDate: jMoment.utc(),
    scaleFactor: 375,
    enableSwipe: true,
    onDateChange: () => console.log('onDateChange() not provided'),
    enableDateChange: true,
    headingLevel: 1,
  };

  constructor(props) {
    super(props);
    this.state = {
      showMounth:false,
      showYear:false,
      currentMonth: null,
      currentYear: null,
      selectedStartDate: props.selectedStartDate || null,
      selectedEndDate: props.selectedEndDate || null,
      styles: {},
      ...this.updateScaledStyles(props),
      ...this.updateMonthYear(props.initialDate),
    };
    this.updateScaledStyles = this.updateScaledStyles.bind(this);
    this.updateMonthYear = this.updateMonthYear.bind(this);
    this.handleOnPressPrevious = this.handleOnPressPrevious.bind(this);
    this.handleOnPressNext = this.handleOnPressNext.bind(this);
    this.handleOnPressDay = this.handleOnPressDay.bind(this);
    this.onSwipe = this.onSwipe.bind(this);
    this.resetSelections = this.resetSelections.bind(this);
    this.handelShowMounth= this.handelShowMounth.bind(this)
    this.handleShowYear= this.handleShowYear.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    let newStyles = {};
    let doStateUpdate = false;

    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      newStyles = this.updateScaledStyles(this.props);
      doStateUpdate = true;
    }

    let newMonthYear = {};
    if (
      !jMoment.utc(prevProps.initialDate).isSame(this.props.initialDate, 'day')
    ) {
      newMonthYear = this.updateMonthYear(this.props.initialDate);
      doStateUpdate = true;
    }

    let selectedDateRanges = {};
    if (
      (this.props.selectedStartDate &&
        !jMoment
          .utc(prevState.selectedStartDate)
          .isSame(this.props.selectedStartDate, 'day')) ||
      (this.props.selectedEndDate &&
        !jMoment
          .utc(prevState.selectedEndDate)
          .isSame(this.props.selectedEndDate, 'day'))
    ) {
      const { selectedStartDate = null, selectedEndDate = null } = this.props;
      selectedDateRanges = {
        selectedStartDate,
        selectedEndDate,
      };
      doStateUpdate = true;
    }

    if (doStateUpdate) {
      this.setState({ ...newStyles, ...newMonthYear, ...selectedDateRanges });
    }
  }

  updateScaledStyles(props) {
    const {
      isRTL,
      scaleFactor,
      selectedDayColor,
      selectedDayTextColor,
      todayBackgroundColor,
      width,
      height,
      dayShape,
    } = props;

    // The styles in makeStyles are intially scaled to this width
    const containerWidth = width ? width : Dimensions.get('window').width;
    const containerHeight = height ? height : Dimensions.get('window').height;
    const initialScale =
      Math.min(containerWidth, containerHeight) / scaleFactor;

    return {
      styles: makeStyles({
        isRTL,
        initialScale,
        backgroundColor: selectedDayColor,
        textColor: selectedDayTextColor,
        todayBackgroundColor,
        dayShape,
      }),
    };
  }

  updateMonthYear(initialDate = this.props.initialDate) {
    return {
      currentMonth: parseInt(jMoment.utc(initialDate).jMonth()),
      currentYear: parseInt(jMoment.utc(initialDate).jYear()),
    };
  }

  handleOnPressDay(day) {
    const {
      currentYear,
      currentMonth,
      selectedStartDate,
      selectedEndDate,
    } = this.state;

    const { allowRangeSelection, onDateChange, enableDateChange } = this.props;

    if (!enableDateChange) {
      return;
    }

    const date = jMoment
      .utc()
      .jYear(currentYear)
      .jMonth(currentMonth)
      .jDate(day);

    if (
      allowRangeSelection &&
      selectedStartDate &&
      date.isSameOrAfter(selectedStartDate) &&
      !selectedEndDate
    ) {
      this.setState({
        selectedEndDate: date,
      });
      // propagate to parent date has changed
      onDateChange(date, Utils.END_DATE);
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: null,
      });
      // propagate to parent date has changed
      onDateChange(date, Utils.START_DATE);
    }
  }

  handleOnPressPrevious() {
    let { currentMonth, currentYear } = this.state;
    let previousMonth = currentMonth - 1;
    // if previousMonth is negative it means the current month is January,
    // so we have to go back to previous year and set the current month to December
    if (previousMonth < 0) {
      previousMonth = 11;
      currentYear -= 1; // decrement year
      this.setState({
        currentMonth: parseInt(previousMonth), // setting month to December
        currentYear: parseInt(currentYear),
      });
    } else {
      this.setState({
        currentMonth: parseInt(previousMonth),
        currentYear: parseInt(currentYear),
      });
    }
    this.props.onMonthChange &&
      this.props.onMonthChange(
        jMoment
          .utc()
          .jYear(currentYear)
          .jMonth(currentMonth)
          .jDate(1),
      );
  }

  handleOnPressNext() {
    let { currentMonth, currentYear } = this.state;
    let nextMonth = currentMonth + 1;
    // if nextMonth is greater than 11 it means the current month is December,
    // so we have to go forward to the next year and set the current month to January
    if (nextMonth > 11) {
      nextMonth = 0;
      currentYear += 1; // increment year
      this.setState({
        currentMonth: parseInt(nextMonth), // setting month to January
        currentYear: parseInt(currentYear),
      });
    } else {
      this.setState({
        currentMonth: parseInt(nextMonth),
        currentYear: parseInt(currentYear),
      });
    }
    this.props.onMonthChange &&
      this.props.onMonthChange(
        jMoment
          .utc()
          .jYear(currentYear)
          .jMonth(currentMonth)
          .jDate(1),
      );
  }

  onSwipe(gestureName) {
    if (typeof this.props.onSwipe === 'function') {
      this.props.onSwipe(gestureName);
      return;
    }
    switch (gestureName) {
      case SWIPE_LEFT:
        if (this.props.isRTL) this.handleOnPressPrevious();
        else this.handleOnPressNext();
        break;
      case SWIPE_RIGHT:
        if (this.props.isRTL) this.handleOnPressNext();
        else this.handleOnPressPrevious();
        break;
    }
  }

  resetSelections() {
    this.setState({
      selectedStartDate: null,
      selectedEndDate: null,
    });
  }

  selectMounth(mounth){
    let { currentMonth, currentYear } = this.state;
    let nextMonth = mounth;
    this.setState({
      currentMonth: parseInt(nextMonth),
      currentYear: parseInt(currentYear),
    });
    this.props.onMonthChange &&
      this.props.onMonthChange(
        jMoment
          .utc()
          .jYear(currentYear)
          .jMonth(currentMonth)
          .jDate(1),
      );
      this.setState({showMounth:false})

  }

  selectYear(count){
     let {currentYear } = this.state;
      currentYear = count; 
      this.setState({
        currentYear: parseInt(currentYear),
        showYear:false
      });
      this.props.onMonthChange &&
      this.props.onMonthChange(
        jMoment
          .utc()
          .jYear(currentYear)
          .jMonth(currentMonth)
          .jDate(1),
      );
  }

  handelShowMounth(){
    this.setState({showMounth:true, showYear:false})
  }
  handleShowYear(){
     this.setState({showMounth:false, showYear:true})
  }

  render() {
    const {
      currentMonth,
      currentYear,
      selectedStartDate,
      selectedEndDate,
      styles,
    } = this.state;

    const {
      allowRangeSelection,
      startFromMonday,
      initialDate,
      minDate,
      maxDate,
      weekdays,
      months,
      previousTitle,
      nextTitle,
      textStyle,
      todayTextStyle,
      selectedDayStyle,
      selectedRangeStartStyle,
      selectedRangeStyle,
      selectedRangeEndStyle,
      disabledDates,
      minRangeDuration,
      maxRangeDuration,
      swipeConfig,
      customDatesStyles,
      enableDateChange,
      headingLevel,
      years
    } = this.props;

    let _disabledDates = [];

    // Convert input date into timestamp
    if (disabledDates) {
      if (Array.isArray(disabledDates)) {
        // Convert input date into timestamp
        disabledDates.map(date => {
          let thisDate = jMoment(date);
          thisDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          _disabledDates.push(thisDate.valueOf());
        });
      } else if (disabledDates instanceof Function) {
        _disabledDates = disabledDates;
      }
    }

    let minRangeDurationTime = [];

    if (allowRangeSelection && minRangeDuration) {
      if (Array.isArray(minRangeDuration)) {
        minRangeDuration.map(minRangeDuration => {
          let thisDate = jMoment.utc(minRangeDuration.date);
          // thisDate.set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
          minRangeDurationTime.push({
            date: thisDate.valueOf(),
            minDuration: minRangeDuration.minDuration,
          });
        });
      } else {
        minRangeDurationTime = minRangeDuration;
      }
    }

    let maxRangeDurationTime = [];

    if (allowRangeSelection && maxRangeDuration) {
      if (Array.isArray(maxRangeDuration)) {
        maxRangeDuration.map(maxRangeDuration => {
          let thisDate = jMoment.utc(maxRangeDuration.date);
          // thisDate.set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
          maxRangeDurationTime.push({
            date: thisDate.valueOf(),
            maxDuration: maxRangeDuration.maxDuration,
          });
        });
      } else {
        maxRangeDurationTime = maxRangeDuration;
      }
    }

    return (
      
        <Swiper
        onSwipe={direction => this.props.enableSwipe && this.onSwipe(direction)}
        config={{ ..._swipeConfig, ...swipeConfig }}
      >
        <TouchableWithoutFeedback onPress={()=>this.setState({showMounth:false, showYear:false})}>
        <View syles={styles.calendar}>
          <HeaderControls
            styles={styles}
            currentMonth={currentMonth}
            currentYear={currentYear}
            initialDate={jMoment.utc(initialDate)}
            onPressPrevious={this.handleOnPressPrevious}
            onPressNext={this.handleOnPressNext}
            months={months}
            previousTitle={previousTitle}
            nextTitle={nextTitle}
            textStyle={textStyle}
            headingLevel={headingLevel}
            handelShowMounth={this.handelShowMounth}
            handleShowYear={this.handleShowYear}
          />

          <Weekdays
            styles={styles}
            startFromMonday={startFromMonday}
            weekdays={weekdays}
            textStyle={textStyle}
          />

          <DaysGridView
            enableDateChange={enableDateChange}
            month={currentMonth}
            year={currentYear}
            styles={styles}
            onPressDay={this.handleOnPressDay}
            disabledDates={_disabledDates}
            minRangeDuration={minRangeDurationTime}
            maxRangeDuration={maxRangeDurationTime}
            startFromMonday={startFromMonday}
            allowRangeSelection={allowRangeSelection}
            selectedStartDate={
              selectedStartDate && jMoment.utc(selectedStartDate)
            }
            selectedEndDate={selectedEndDate && jMoment.utc(selectedEndDate)}
            minDate={minDate && jMoment.utc(minDate)}
            maxDate={maxDate && jMoment.utc(maxDate)}
            textStyle={textStyle}
            todayTextStyle={todayTextStyle}
            selectedDayStyle={selectedDayStyle}
            selectedRangeStartStyle={selectedRangeStartStyle}
            selectedRangeStyle={selectedRangeStyle}
            selectedRangeEndStyle={selectedRangeEndStyle}
            customDatesStyles={customDatesStyles}
          />
        </View>
         </TouchableWithoutFeedback>

       {this.state.showYear? <View style={{flexDirection:'row',position:'absolute', backgroundColor:'#f7f7f8', elevation:3, top:50, alignSelf:'center'}}>
           <TouchableOpacity onPress={()=>{this.selectYear(years[2])}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentYear==years[2]?'#f0b90a':'transparent', color:'#000'}}>{years[2]}</Text>
            </TouchableOpacity>
             <TouchableOpacity onPress={()=>{this.selectYear(years[1])}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentYear==years[1]?'#f0b90a':'transparent', color:'#000'}}>{years[1]}</Text>
            </TouchableOpacity>
             <TouchableOpacity onPress={()=>{this.selectYear(years[0])}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentYear==years[0]?'#f0b90a':'transparent', color:'#000'}}>{years[0]}</Text>
            </TouchableOpacity>
        </View>:null}

        {this.state.showMounth? <View style={{  width:230, alignSelf:'center',alignItems:'center',position:'absolute', top:50, backgroundColor:'#f7f7f8',elevation:1}}>
            <View style={{flexDirection:'row',justifyContent:'space-between', width:230 }}>
              <TouchableOpacity onPress={()=>{this.selectMounth(0)}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==0?'#f0b90a':'transparent', color:'#000'}}>فروردین</Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={()=>{this.selectMounth(1)}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==1?'#f0b90a':'transparent', color:'#000'}}>اردیبهشت</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.selectMounth(2)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==2?'#f0b90a':'transparent', color:'#000'}}>خرداد</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between', width:230 }}>
              <TouchableOpacity onPress={()=>{this.selectMounth(3)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==3?'#f0b90a':'transparent', color:'#000'}}>تیر</Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={()=>{this.selectMounth(4)}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==4?'#f0b90a':'transparent', color:'#000'}}>مرداد</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.selectMounth(5)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==5?'#f0b90a':'transparent', color:'#000'}}>شهریور</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between', width:230 }}>
              <TouchableOpacity onPress={()=>{this.selectMounth(6)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==6?'#f0b90a':'transparent', color:'#000'}}>مهر</Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={()=>{this.selectMounth(7)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==7?'#f0b90a':'transparent', color:'#000'}}>آبان</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.selectMounth(8)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==8?'#f0b90a':'transparent', color:'#000'}}>آذر</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between', width:230 }}>
              <TouchableOpacity onPress={()=>{this.selectMounth(9)}}>
                <Text style={{...textStyle,fontSize:14, width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==9?'#f0b90a':'transparent', color:'#000'}}>دی</Text>
              </TouchableOpacity>
               <TouchableOpacity onPress={()=>{this.selectMounth(10)}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==10?'#f0b90a':'transparent', color:'#000'}}>بهمن</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.selectMounth(11)}}>
                <Text style={{...textStyle,fontSize:14,width:75,textAlignVertical:'center', height:48,textAlign:'center',backgroundColor:currentMonth==11?'#f0b90a':'transparent', color:'#000'}}>اسفند</Text>
              </TouchableOpacity>
            </View>
        </View>
        :null} 
     </Swiper>
   
     
       );
  }
}

module.exports = PersianCalendarPicker;
