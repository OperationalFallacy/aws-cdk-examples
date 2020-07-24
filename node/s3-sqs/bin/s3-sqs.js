#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { S3SqsStack } = require('../lib/s3-sqs-stack');

const app = new cdk.App();

new S3SqsStack(app, 'S3SqsStackDev', {
    env : {
        region : 'us-east-1'
    }
});

new S3SqsStack(app, 'S3SqsStackTest', {
    env : {
        region : 'us-east-1'
    }
});
