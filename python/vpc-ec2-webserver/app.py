#!/usr/bin/env python3

from aws_cdk import core
from vpc_ec2_webserver.vpc_ec2_webserver_stack import CdkVpcEc2Stack
import os

env = core.Environment(
    account=os.environ["CDK_DEFAULT_ACCOUNT"],
    region=os.environ["CDK_DEFAULT_REGION"])

app = core.App()
CdkVpcEc2Stack(app, "cdk-vpc-ec2", env=env)

app.synth()
