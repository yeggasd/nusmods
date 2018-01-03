// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import type { ModulesMap } from 'reducers/moduleBank';
import type { ColorMapping } from 'types/reducers';
import type { ModifiableLesson, ModuleCode, Semester } from 'types/modules';
import type {
  SemTimetableConfig,
} from 'types/timetables';

import {
  addModule,
  cancelModifyLesson,
  changeLesson,
  modifyLesson,
  removeModule,
} from 'actions/timetables';
import { toggleTimetableOrientation } from 'actions/theme';
import {
  getModuleTimetable,
} from 'utils/modules';
import { arrangeLessonsForWeek } from 'utils/timetables';
import Timetable from './Timetable';

type Props = {
  // Own props
  semester: Semester,
  timetable: SemTimetableConfig,
  colors: ColorMapping,
  isVerticalOrientation: boolean,

  modules: ModulesMap,
  activeLesson: ?ModifiableLesson,
  hiddenInTimetable: ModuleCode[],

  // Actions
  modifyLesson: Function,
  changeLesson: Function,
  cancelModifyLesson: Function,
};

type State = {
  isScrolledHorizontally: boolean,
};

class TimetableContainer extends Component<Props, State> {
  timetableWrapperDom: ?HTMLElement;

  state: State = {
    isScrolledHorizontally: false,
  };

  componentDidMount() {
    if (this.timetableWrapperDom) {
      this.timetableWrapperDom.addEventListener('scroll', this.handleScroll, { passive: true });
    }
  }

  componentWillUnmount() {
    this.cancelModifyLesson();
    if (this.timetableWrapperDom) {
      this.timetableWrapperDom.removeEventListener('scroll', this.handleScroll);
    }
  }

  onModifyCell = (lesson: ModifiableLesson) => {
    if (lesson.isAvailable) {
      this.props.changeLesson(this.props.semester, lesson);
    } else if (lesson.isActive) {
      this.props.cancelModifyLesson();
    } else {
      this.props.modifyLesson(lesson);
    }
  };

  handleScroll = () => {
    const isScrolledHorizontally =
      !!this.timetableWrapperDom && this.timetableWrapperDom.scrollLeft > 0;
    if (this.state.isScrolledHorizontally !== isScrolledHorizontally) {
      this.setState({ isScrolledHorizontally });
    }
  };

  cancelModifyLesson = () => {
    if (this.props.activeLesson) {
      this.props.cancelModifyLesson();
    }
  };

  render() {
    const { semester, modules, colors, activeLesson } = this.props;



    return (
      <div
        ref={(r) => {
          this.timetableWrapperDom = r;
        }}
      >
        <Timetable
          lessons={arrangeLessonsForWeek(lessons)}
          isVerticalOrientation={this.props.isVerticalOrientation}
          isScrolledHorizontally={this.state.isScrolledHorizontally}
          onModifyCell={this.onModifyCell}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { semester, timetable } = ownProps;
  const modules = state.moduleBank.modules;
  const hiddenInTimetable = state.settings.hiddenInTimetable;

  return {
    semester,
    timetable,
    modules,
    activeLesson: state.app.activeLesson,
    hiddenInTimetable,
  };
}

export default connect(mapStateToProps, {
  modifyLesson,
  changeLesson,
  cancelModifyLesson,
})(TimetableContainer);
