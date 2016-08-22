import config from '../../config';
import api    from './api';
import mongo  from '../../libs/mongo';
import async  from 'async';

let c = mongo.collections;

export default {

    /**
     * API
     *
     * Standard AGAVE API Interactions
     */
    api: api,

    // compound API interactions ------------------------------------------------

    /**
     * Get Outputs
     *
     * Takes a Job ID and calls back with an
     * array of of results/outputs.
     */
    getOutputs (jobId, callback) {
        let results = [];
        let logs = [];
        let status = null;
        api.getJobLogs(jobId, (err, res) => {
            // get main logs files
            if (res.body.result) {
                async.each(res.body.result, (file, cb) => {
                    if (file.type === 'file' && file.length > 0) {
                        logs.push(file);
                        if (file.name === 'exit_code.txt') {
                            let path = file._links.self.href;
                            api.getPath(path, (err, res) => {
                                status = res.body;
                                cb();
                            });
                        } else {cb();}
                    }
                }, () => {
                    api.getJobResults(jobId, (err, resp) => {
                        if (resp.body.result) {
                            results = results.concat(resp.body.result);
                        }
                        results = results.length > 0 ? results : null;
                        callback(results, logs, status);
                    });
                });
            }
        });
    },

    /**
     * Submit Job
     *
     * Takes a job definition and callsback
     * with job submission results.
     */
    submitJob (job, callback) {
        let attempts = job.attempts ? job.attempts + 1: 1;

        // form job body
        let body = {
            name:              'crn-automated-job',
            appId:             job.appId,
            batchQueue:        job.batchQueue,
            executionSystem:   job.executionSystem,
            maxRunTime:        '05:00:00',
            memoryPerNode:     job.memoryPerNode,
            nodeCount:         job.nodeCount,
            processorsPerNode: job.processorsPerNode,
            archive:           true,
            archiveSystem:     'openfmri-archive',
            archivePath:       null,
            inputs: {},
            parameters: job.parameters ? job.parameters : {},
            notifications: [
                {
                    url:        config.url + config.apiPrefix +  'jobs/${JOB_ID}/results',
                    event:      '*',
                    persistent: true
                }
            ]
        };

        // set input
        let inputKey = job.input ? job.input : 'bidsFolder';
        body.inputs[inputKey] = config.agave.storage + job.datasetHash;

        // submit job
        api.createJob(body, (err, resp) => {

            // handle submission errors
            if (resp.body.status == 'error') {
                let error = new Error(resp.body.message);
                error.http_code = 400;
                return callback(error, null);
            }
            if (resp.statusCode !== 200 && resp.statusCode !== 201) {
                let error = new Error(resp.body ? resp.body : 'AGAVE was unable to process this job submission.');
                error.http_code = resp.statusCode ? resp.statusCode : 503;
                return callback(error, null);
            }

            // store job
            c.jobs.insertOne({
                jobId:             resp.body.result.id,
                agave:             resp.body.result,

                appId:             body.appId,
                parameters:        body.parameters,
                memoryPerNode:     body.memoryPerNode,
                nodeCount:         body.nodeCount,
                processorsPerNode: body.processorsPerNode,
                batchQueue:        body.batchQueue,

                appLabel:          job.appLabel,
                appVersion:        job.appVersion,
                datasetHash:       job.datasetHash,
                datasetId:         job.datasetId,
                datasetLabel:      job.datasetLabel,
                userId:            job.userId,
                parametersHash:    job.parametersHash,
                snapshotId:        job.snapshotId,

                attempts:          attempts
            }, () => {
                callback(null, resp.body);
            });
        });
    }

};