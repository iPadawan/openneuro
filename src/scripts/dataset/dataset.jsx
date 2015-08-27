// dependencies -------------------------------------------------------

import React      from 'react';
import {State}    from 'react-router';
import mixin      from 'es6-react-mixins';
import scitran    from '../utils/scitran';
import FileTree   from '../upload/upload.file-tree.jsx';
import Spinner    from '../common/partials/spinner.component.jsx';
import userStore  from '../user/user.store';
import WarnButton from '../common/forms/warn-button.component.jsx'; 
import {Accordion, Panel} from 'react-bootstrap';

export default class Dataset extends mixin(State) {

// life cycle events --------------------------------------------------

	constructor() {
		super();
		this.state = {
			loading: false,
			dataset: null,
			status: null
		};
	}

	componentDidMount() {
		let self = this;
		let params = this.getParams();
		self.setState({loading: true});
		scitran.getBIDSDataset(params.datasetId, function (res) {
			if (res.status === 404 || res.status === 403) {
				self.setState({status: res.status, loading: false});
			} else {
				self.setState({dataset: res, loading: false});
			}
		});
	}

	render() {
		let loading   = this.state.loading;
		let dataset   = this.state.dataset;
		let status    = this.state.status;
		let userOwns  = this._userOwns(dataset);

		let publishBtn;
		if (userOwns && !dataset[0].public) {
			publishBtn = <WarnButton message="Make Public" confirm="Yes Make Public" icon="fa-share" action={this._publish.bind(this, dataset[0]._id)} />;
		}

		let content;
		if (dataset) {
			content = (
				<div>
					<h1>{dataset[0].name}</h1>
					{publishBtn}
					<Accordion className="fileStructure fadeIn">
						<Panel header={dataset[0].name} eventKey='1'>
					  		<FileTree tree={dataset} />
					  	</Panel>
			  		</Accordion>
				</div>
			);
		} else {
			let message;
			if (status === 404) {message = 'Dataset not found.';}
			if (status === 403) {message = 'You are not authorized to view this dataset.';}
			content = (
				<div>
					<h1>{message}</h1>
				</div>
			);
		}

		return (
			<div className="fadeIn inner-route dataset">
            	<Spinner text="loading" active={loading} />
            	{content}
			</div>
    	);
	}

// custon methods -----------------------------------------------------

	_publish(datasetId) {
		let self = this;
		scitran.updateProject(datasetId, {body: {public: true}}, function (err, res) {
			if (!err) {
				let dataset = self.state.dataset;
				dataset[0].public = true;
				self.setState({dataset});
			}
		});
	}

	_userOwns(dataset) {
		let userOwns = false
		if (dataset && dataset[0].permissions)
		for (let user of dataset[0].permissions) {
			if (userStore.data.scitran._id === user._id) {
				userOwns = true;
			}
		}
		return userOwns;
	}
}