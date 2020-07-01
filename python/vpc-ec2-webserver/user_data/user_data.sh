exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

# update packages, install nginx
sudo yum update -y
amazon-linux-extras install -y nginx1.12
sudo yum -y install nginx jq

# See: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html
# sdb->xvdb
EC2_INSTANCE_ID=$(curl -s http://instance-data/latest/meta-data/instance-id)

DATA_STATE="unknown"
REGION=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | jq .region -r)
env

until [ "${DATA_STATE}" == "attached" ]; do
    DATA_STATE=$(aws ec2 describe-volumes \
    --region ${REGION} \
    --filters \
        Name=attachment.instance-id,Values=${EC2_INSTANCE_ID} \
        Name=attachment.device,Values=/dev/sdb \
    --query Volumes[].Attachments[].State \
    --output text)

    sleep 5
done

update_nginx_conf() {
    echo "Updating nginx config"
    sed -i 's#root         /usr/share/nginx/html#root /data#' /etc/nginx/nginx.conf

get_index_location() {
    set -x
    ls -al /data
    set +x
}

get_mounts() {
    set -x
    lsblk
    df
    set +x
}
get_addr() {
    curl -s http://169.254.169.254/latest/meta-data/public-ipv4
}

tee /data/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Litl Nginx created by CDK</title>
  </head>
  <body>
    <div>
        <h1 style="text-align: center;">Hello AWS World</h1>
    </div>
    <pre>
        <code>
Filesystems information:

$(get_mounts 2>&1)

ndex.html file location:
$(get_index_location 2>&1)

Public ipv4: $(get_addr 2>&1)
        <code>
    </pre>
  </body>
</html>
EOF

}

# Format /dev/xvdb if it does not contain a partition yet
if [ "$(file -b -s /dev/xvdb)" == "data" ]; then
    mkfs -t ext4 /dev/xvdb
    mkdir -p /data
    mount /dev/xvdb /data
    # Persist the volume in /etc/fstab so it gets mounted again
    echo '/dev/xvdb /data ext4 defaults,nofail 0 2' >> /etc/fstab
    update_nginx_conf
fi

systemctl enable nginx.service
systemctl start nginx.service