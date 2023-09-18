const mongoose = require('mongoose')
const users = require('../schema/user.js')

const ObjectId = mongoose.Types.ObjectId;

const db = {
  users
}


const updateDocument = async (collection, filter, update, options) => {
  try {
    let result = await db[collection].findOneAndUpdate(filter, update, options);
    return result;
  } catch (error) {
    console.error("Error findOneAndUpdate documents: ", error)

    throw error;
  }
}



const findDocuments = async (collection, filter, options) => {
  try {
    let result = await db[collection].find(filter, options);

    return result;
  } catch (error) {
    console.error("Error find documents: ", error)

    throw error;
  }
}


const findSingleDocument = async (collection, filter, projection) => {
  try {
    let result = await db[collection].findOne(filter, projection);

    return result;
  } catch (error) {
    console.error("Error findOne documents: ", error)

    throw error;
  }
}



const insertSingleDocument = async (collection, document) => {
  try {
    let result = await db[collection].create(document)

    return result;
  } catch (error) {
    console.error("Error inserting document: ", error)

    throw error;
  }
}

const updateOneDocument = async (collection, filter, update) => {
  try {
    let result = await db[collection].updateOne(filter, update)

    return result;5
  } catch (error) {
    console.error("Error updating document: ", error)

    throw error;
  }
}

const findByIdAndUpdate = async (collection, id, update) => {
  try {
    let filter = { _id: new ObjectId(id) };
    let result = await db[collection].updateOne(filter, update)

    return result;
  } catch (error) {
    console.error("Error finding and updating document by ID: ", error)

    throw error;
  }
}

const findOneAndUpdate = async (collection, filter, update) => {
  try {
    let options = {
      new: true, // return the updated document instead of the original      
      useFindAndModify: false, // use the MongoDB driver's findOneAndUpdate method instead of Mongoose's deprecated method    
    }
    let updatedDoc = await db[collection].findOneAndUpdate(filter, update, options).exec()

    return updatedDoc;
  }
  catch (error) {
    console.error("Error finding one and updating document: ", error.message)

    throw error;
  }
}




module.exports = {
  updateDocument,
  findDocuments,
  findSingleDocument,
  insertSingleDocument,
  updateOneDocument,
  findByIdAndUpdate,
  findOneAndUpdate
}