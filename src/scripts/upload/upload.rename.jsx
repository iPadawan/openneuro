// dependencies -------------------------------------------------------

import React       from 'react';
import Reflux      from 'reflux';
import Actions     from './upload.actions.js';
import UploadStore from './upload.store.js';
import Input       from '../common/forms/input.jsx';
import FileTree    from './upload.file-tree.jsx';
import {Accordion, Panel} from 'react-bootstrap';

let Rename = React.createClass({

	mixins: [Reflux.connect(UploadStore)],

// life cycle events --------------------------------------------------

	render () {
		let dirName   = this.state.dirName,
			nameError = this.state.nameError,
			tree      = this.state.tree,
			fileStuctureDirName = dirName + " File Structure";

		return (
			<div>
				<span className="message fadeIn">Rename your dataset (optional)</span>
				<div className="dir-name has-input clearfix fadeIn">
					{nameError ? <span className="message error characterError">{nameError}</span> : null}
					<label className="add-name"><i className="folderIcon fa fa-folder-open" /></label>
					<Input type="text" placeholder="dataset name" initialValue={dirName} onChange={this._updateDirName} />
				</div>
				<Accordion className="fileStructure fadeIn">
					<Panel header={fileStuctureDirName} eventKey='1'>
				  		<FileTree tree={tree}/>
				  	</Panel>
			  	</Accordion>
				<button className="btn-blue" disabled={nameError} onClick={this._validate.bind(null, this.state.list)}>Continue</button>
			</div>
    	);
	},

// custom methods -----------------------------------------------------

	_updateDirName: function (e) {
		Actions.updateDirName(e.target.value);
	},

	_validate: Actions.validate

});


export default Rename;