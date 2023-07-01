const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction, TopicCreateTransaction, TopicInfoQuery, TopicUpdateTransaction, TopicMessageSubmitTransaction } = require("@hashgraph/sdk");
require('dotenv').config();

async function environmentSetup() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }
    else {
        console.log('------------------------------------');
        console.log("Account ID :" + myAccountId);
        console.log("My Private Key  :" + myPrivateKey.substring(1, 8) + "...");
        console.log('------------------------------------');

    }

    //client creating and init
    const client = Client.forTestnet()
    client.setOperator(myAccountId, myPrivateKey);

    //generating keys
    const adminKey = PrivateKey.generate();
    const submitKey = PrivateKey.generate();

    // topic creation
    let transaction = await new TopicCreateTransaction()
        .setAdminKey(adminKey)
        .setSubmitKey(submitKey)
        .setTopicMemo("issam's topic memo")
        .freezeWith(client);

    //Signing transaction and executing
    let txSignedByAdminKey = await transaction.sign(adminKey);
    let txSignedBySubmitKey = await txSignedByAdminKey.sign(submitKey);
    const txCreateTopicSigned = await txSignedBySubmitKey.execute(client);

    const txReceipt = await txCreateTopicSigned.getReceipt(client);
    const topicId = txReceipt.topicId;
    console.log('------------------------------------');
    console.log("topic ID: " + topicId);
    console.log('------------------------------------');

    async function getMemo(topicId) {
        const topic = await new TopicInfoQuery()
            .setTopicId(topicId)
            .execute(client);

        console.log('------------------------------------');
        console.log("Topic Memo:", topic.topicMemo);
        console.log('------------------------------------');
    }

    // getting topic data
    await getMemo(topicId)


    // updating memo
    let updateTx = await new TopicUpdateTransaction()
        .setTopicId(topicId)
        .setTopicMemo("new memo")
        .freezeWith(client);

    //Signing transaction and executing
    txSignedByAdminKey = await updateTx.sign(adminKey);
    txSignedBySubmitKey = await txSignedByAdminKey.sign(submitKey);
    const txUpdateTopicSigned = await txSignedBySubmitKey.execute(client);


    // getting topic data
    await getMemo(topicId)

    // Submit a message to the topic
    const TxMessageId = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage("New Message!")
        .execute(client);

    console.log("Message transaction ID:", TxMessageId);
    console.log("Message published");

}
environmentSetup().catch((error) => {
    console.log("********************************");
    console.log(error);
    console.log("********************************");

});