// @flow
import React from 'react';
import classnames from 'classnames';

import type { ModifiableLesson } from 'types/modules';

import { LESSON_TYPE_ABBREV } from 'utils/timetables';

import styles from './TimetableCell.scss';

type Props = {
  lesson: ModifiableLesson,
  style: Object,
  isScrolledHorizontally: boolean,
  onModifyCell?: Function,
};

function TimetableCell(props: Props) {
  const lesson = props.lesson;
  return (
    <button
      className={classnames(styles.cell, `color-${lesson.colorIndex}`, {
        [styles.cellIsModifiable]: lesson.isModifiable,
        [styles.cellIsAvailable]: lesson.isAvailable,
        [styles.cellIsActive]: lesson.isActive,
        [styles.cellIsActiveScrolled]: lesson.isActive && props.isScrolledHorizontally,
      })}
      onClick={(event) => {
        event.stopPropagation();
        if (props.onModifyCell) {
          props.onModifyCell(lesson);
        }
      }}
      style={props.style}
    >
      <div className={styles.cellContainer}>
        <div className={styles.moduleCode}>{lesson.ModuleCode}</div>
        <div>
          {LESSON_TYPE_ABBREV[lesson.LessonType]} [{lesson.ClassNo}]
        </div>
        <div>{lesson.Venue}</div>
        {lesson.WeekText !== 'Every Week' && <div>{lesson.WeekText}</div>}
      </div>
    </button>
  );
}

export default TimetableCell;
