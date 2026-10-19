const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
});

const uploadToS3 = async (
    data,
    fileName,
    contentType = "application/octet-stream"
) => {
    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: fileName,
                Body: data,
                ContentType: contentType,
            })
        );

        // Temporary private download URL (5 minutes)
        const fileUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: fileName,
            }),
            { expiresIn: 300 }
        );

        console.log("S3 upload successful");
        return fileUrl;
    } catch (error) {
        console.error("S3 Upload Error:", error.message);
        throw error;
    }
};

module.exports = {
    uploadToS3,
};