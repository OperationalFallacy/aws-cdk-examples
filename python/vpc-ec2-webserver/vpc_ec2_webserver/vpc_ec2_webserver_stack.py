from aws_cdk import (
    aws_ec2 as ec2,
    aws_iam as iam,
    core    
)
ec2_type = "t2.micro"

with open("./user_data/user_data.sh") as f:
    raw_user_data = f.read()

class CdkVpcEc2Stack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        user_data = ec2.UserData.for_linux(shebang='#!/bin/bash -xe')
        user_data.add_commands(raw_user_data)
                            
        # The code that defines your stack goes here
        vpc = ec2.Vpc(self, "DemoVpc",
                    subnet_configuration=[
                        ec2.SubnetConfiguration(
                            name="public-subnet",
                            subnet_type=ec2.SubnetType.PUBLIC
                        )],
                    )
        role = iam.Role(self, "InstanceSSM", assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"))
        role.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonEC2RoleforSSM"))
        role.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("AmazonEC2ReadOnlyAccess"))

        host = ec2.Instance(self, "myEC2",
                            instance_type=ec2.InstanceType(
                                instance_type_identifier=ec2_type),
                            instance_name="littl_htt",
                            machine_image=ec2.MachineImage.latest_amazon_linux(
                                generation=ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
                                edition=ec2.AmazonLinuxEdition.STANDARD,
                                virtualization=ec2.AmazonLinuxVirt.HVM,
                                storage=ec2.AmazonLinuxStorage.GENERAL_PURPOSE),
                            vpc=vpc,
                            vpc_subnets=ec2.SubnetSelection(
                                subnet_type=ec2.SubnetType.PUBLIC),
                            user_data=user_data,
                            role = role,
                            key_name='ec2demo'
                            )

        # ec2.Instance has no property of BlockDeviceMappings, add via lower layer cdk api:
        host.instance.add_property_override("BlockDeviceMappings", [{
            "DeviceName": "/dev/xvda",
            "Ebs": {
                "VolumeSize": "8",
                "VolumeType": "gp2",
                "DeleteOnTermination": "true"
            }
        }, {
            "DeviceName": "/dev/sdb",
            "Ebs": {"VolumeSize": "1"}
        }
        ])

        host.connections.allow_from_any_ipv4(
            ec2.Port.tcp(22), "Allow ssh from internet")
        host.connections.allow_from_any_ipv4(
            ec2.Port.tcp(80), "Allow http from internet")

        ec2.CfnEIP(self, 'eip', 
            instance_id = host.instance.ref,
            tags=[core.CfnTag(key='Name',value='eip')]
        )
        
        core.CfnOutput(self, "Public IP",
                       value=host.instance_public_ip)
        core.CfnOutput(self, "Instance ID",
                       value=host.instance_id)