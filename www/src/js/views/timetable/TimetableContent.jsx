// @flow
import React, { Component, type Node } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import config from 'config';

import type { ModulesMap } from 'reducers/moduleBank';
import type { ColorMapping, TimetableOrientation, ModuleSelectList } from 'types/reducers';
import { HORIZONTAL } from 'types/reducers';
import type { Lesson, Module, ModuleCode, Semester } from 'types/modules';
import type { SemTimetableConfig, SemTimetableConfigWithLessons } from 'types/timetables';

import classnames from 'classnames';
import { getSemModuleSelectList } from 'reducers/moduleBank';
import {
  addModule,
  changeLesson,
  removeModule,
} from 'actions/timetables';
import { toggleTimetableOrientation } from 'actions/theme';
import { formatExamDate, getModuleExamDate } from 'utils/modules';
import {
  hydrateSemTimetableWithLessons,
  findExamClashes,
  getSemesterModules,
} from 'utils/timetables';
import ModulesSelect from 'views/timetable/ModulesSelect';
import CorsNotification from 'views/components/cors-info/CorsNotification';
import Announcements from 'views/components/Announcements';
import Online from 'views/components/Online';
import TimetableActions from './TimetableActions';
import TimetableModulesTable from './TimetableModulesTable';
import styles from './TimetableContent.scss';
import TimetableContainer from './TimetableContainer';

type Props = {
  // Own props
  readOnly: boolean,
  header: Node,
  semester: Semester,
  timetable: SemTimetableConfig,
  colors: ColorMapping,

  // From Redux
  timetableWithLessons: SemTimetableConfigWithLessons,
  semModuleList: ModuleSelectList,
  modules: ModulesMap,
  timetableOrientation: TimetableOrientation,
  hiddenInTimetable: ModuleCode[],

  // Actions
  addModule: Function,
  removeModule: Function,
  changeLesson: Function,
  toggleTimetableOrientation: Function,
};

class TimetableContent extends Component<Props> {
  isHiddenInTimetable = (moduleCode: ModuleCode) =>
    this.props.hiddenInTimetable.includes(moduleCode);

  // Returns modules currently in the timetable
  addedModules(): Array<Module> {
    const modules = getSemesterModules(this.props.timetableWithLessons, this.props.modules);
    return _.sortBy(modules, (module: Module) => getModuleExamDate(module, this.props.semester));
  }

  // Returns component with table(s) of modules
  renderModuleSections(horizontalOrientation) {
    const { readOnly } = this.props;

    const renderModuleTable = (modules) => (
      <TimetableModulesTable
        modules={modules.map((module) => ({
          ...module,
          colorIndex: this.props.colors[module.ModuleCode],
          hiddenInTimetable: this.isHiddenInTimetable(module.ModuleCode),
        }))}
        horizontalOrientation={horizontalOrientation}
        semester={this.props.semester}
        onRemoveModule={(moduleCode) => this.props.removeModule(this.props.semester, moduleCode)}
        readOnly={readOnly}
      />
    );

    // Separate added modules into sections of clashing modules
    const modules = this.addedModules();
    const clashes: { [string]: Array<Module> } = findExamClashes(modules, this.props.semester);
    const nonClashingMods: Array<Module> = _.difference(modules, _.flatten(_.values(clashes)));

    if (_.isEmpty(clashes) && _.isEmpty(nonClashingMods)) {
      return (
        <div className="row">
          <div className="col-sm-12">
            <p className="text-sm-center">No modules added.</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {!_.isEmpty(clashes) && (
          <div>
            <div className="alert alert-danger">
              Warning! There are clashes in your exam timetable.
            </div>
            {Object.keys(clashes)
              .sort()
              .map((clashDate) => (
                <div key={clashDate}>
                  <p>
                    Clash on <strong>{formatExamDate(clashDate)}</strong>
                  </p>
                  {renderModuleTable(clashes[clashDate])}
                </div>
              ))}
            <hr />
          </div>
        )}
        {renderModuleTable(nonClashingMods)}
      </div>
    );
  }

  render() {
    const { semester, timetableOrientation, readOnly } = this.props;

    const isVerticalOrientation = timetableOrientation !== HORIZONTAL;

    return (
      <div
        className={classnames('page-container', styles.container, {
          verticalMode: isVerticalOrientation,
        })}
      >
        <Helmet>
          <title>Timetable - {config.brandName}</title>
        </Helmet>

        <CorsNotification />

        <Announcements />

        <div>{this.props.header}</div>

        <div className="row">
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-8': isVerticalOrientation,
            })}
          >
            <TimetableContainer
              timetable={this.props.timetable}
              semester={semester}
              isVerticalOrientation={isVerticalOrientation}
              colors={this.props.colors}
            />
          </div>
          <div
            className={classnames({
              'col-md-12': !isVerticalOrientation,
              'col-md-4': isVerticalOrientation,
            })}
          >
            <div className="row">
              <div className="col-12 no-export">
                <TimetableActions
                  isVerticalOrientation={isVerticalOrientation}
                  toggleTimetableOrientation={this.props.toggleTimetableOrientation}
                  semester={semester}
                  timetable={this.props.timetable}
                />
              </div>
            </div>
            <div className={styles.tableContainer}>
              {!readOnly && (
                <Online>
                  {(isOnline) => (
                    <div className={classnames('col-md-12', styles.modulesSelect)}>
                      <ModulesSelect
                        moduleList={this.props.semModuleList}
                        onChange={(moduleCode) => {
                          this.props.addModule(semester, moduleCode);
                        }}
                        placeholder={
                          isOnline
                            ? 'Add module to timetable'
                            : 'You need to be online to add modules'
                        }
                        disabled={!isOnline}
                      />
                    </div>
                  )}
                </Online>
              )}
              <div className="col-md-12">{this.renderModuleSections(!isVerticalOrientation)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { semester, timetable } = ownProps;
  const modules = state.moduleBank.modules;
  const timetableWithLessons = hydrateSemTimetableWithLessons(timetable, modules, semester);
  const semModuleList = getSemModuleSelectList(state.moduleBank, semester, timetable);
  const hiddenInTimetable = state.settings.hiddenInTimetable || [];

  return {
    semester,
    semModuleList,
    timetable,
    timetableWithLessons,
    modules,
    timetableOrientation: state.theme.timetableOrientation,
    hiddenInTimetable,
  };
}

export default connect(mapStateToProps, {
  addModule,
  removeModule,
  changeLesson,
  toggleTimetableOrientation,
})(TimetableContent);
