import setuptools

with open("README.md") as fp:
    long_description = fp.read()

setuptools.setup(
    name="VPC_EC2_webserver",
    version="0.0.1",

    description="Create basic VPC, Create EC2 on it with UserData to install nginx",
    long_description=long_description,
    long_description_content_type="text/markdown",

    author="Roman Naumenko (roman@naumenko.ca)",

    package_dir={"": "vpc_ec2_webserver"},
    packages=setuptools.find_packages(where="vpc_ec2_webserver"),

    install_requires=[
        "aws-cdk.core",
        "aws-cdk.aws-ec2",
        "aws-cdk.aws-iam"
    ],

    python_requires=">=3.6",

    classifiers=[
        "Development Status :: 4 - Beta",

        "Intended Audience :: Developers",

        "License :: OSI Approved :: BSD 2-Clause License",

        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",

        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",

        "Typing :: Typed",
    ],
)
