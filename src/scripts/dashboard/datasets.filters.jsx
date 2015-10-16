// dependencies -----------------------------------------------------------------------

import React   from 'react';
import Actions from './datasets.actions.js';

// component setup --------------------------------------------------------------------

export default class Filters extends React.Component {

// life cycle events ------------------------------------------------------------------

	render() {
		let direction = this.props.sort.direction;
		let value     = this.props.sort.value;
		let filters   = this.props.filters;

		let icon = direction == '+' ? <i className="fa fa-sort-asc"></i> : <i className="fa fa-sort-desc"></i>;

		let filterButtons;
		if (!this.props.isPublic) {
			filterButtons = (
				<div>
		            <span>Show:</span>
		            <button className={filters.indexOf('public') > -1 ? 'active' : null} onClick={this._filter.bind(this, 'public')}>Public</button>
		            <button className={filters.indexOf('incomplete') > -1 ? 'active' : null} onClick={this._filter.bind(this, 'incomplete')}>Incomplete</button>
		            <button className={filters.indexOf('shared') > -1 ? 'active' : null} onClick={this._filter.bind(this, 'shared')}>Shared with me</button>
		        </div>
		    );
		}

		return (
			<div>
				<div>
		            <span>Sort By: </span>
		            <button onClick={this._sort.bind(this, 'name')}>Name {value == 'name' ? icon : null}</button>
		            <button onClick={this._sort.bind(this, 'timestamp')}>State {value == 'timestamp' ? icon : null}</button>
		        </div>
		        {filterButtons}
	        </div>
		);
	}

// custom methods ---------------------------------------------------------------------

    _filter(value) {
    	Actions.filter(value);
    }

    _sort(value) {
    	let direction;

    	if (value == this.props.sort.value) {
    		direction = this.props.sort.direction == '+' ? '-' : '+';
    	} else {
    		direction = '+';
    	}
        Actions.sort(value, direction);
    }
};