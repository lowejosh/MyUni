import withFirebaseAuth from 'react-with-firebase-auth'
import 'firebase/auth';
import * as firebase from 'firebase/app'; 
import fire from './fire';

let db = firebase.app().database();
let uniRef = db.ref('/universities');
let userRef = db.ref('/users');
let unitRef = db.ref('/units');
let threadRef = db.ref('/threads');
let commentRef = db.ref('/comments');
let catRef = db.ref('/categories');

const userModel = (selectedUni) => {
    return {
        uni: selectedUni
    }
};

const uniModel = (name, state) => {
    return {
        name: name,
        state: state,
        unitCount: 0,
        postCount: 0,
        units: [],
        categories: [],
    }
};

const unitModel = (faculty, name, uniId) => {
    return {
        faculty: faculty,
        name: name,
        threads: [],
    }
};

const categoryModel = (name, uniId) => {
    return {
        uni: uniId,
        name: name,
        threadExists: false,
        threads: 0,
        ratingAvg: null,
    }
};

const threadModel = (title, content, posterId, posterName, categoryId) => {
    return {
        title: title,
        content: content,
        posterId: posterId,
        posterName: posterName,
        categoryId: categoryId,
        timeStamp: Date.parse(new Date().toString()),
        lastReplyTimeStamp: Date.parse(new Date().toString()),
        views: 0,
        comments: 0,
        hasComment: false,
    }
};

const commentModel = (content, uid, uname, threadId) => {
    return {
        content: content,
        timeStamp: Date.parse(new Date().toString()),
        votes: 0,
        posterId: uid,
        posterName: uname,
        threadId: threadId,
    }
};

const ratingModel = (title, content, posterId, posterName, categoryId, targetId, rating) => {
    return {
        title: title,
        content: content,
        posterId: posterId,
        posterName: posterName,
        categoryId: categoryId,
        targetId: targetId,
        rating: rating,
        timeStamp: Date.parse(new Date().toString()),
    }
};



const createUni = (name, state) => {
    let uni = uniModel(name, state);
    let newUniRef = uniRef.push(uni);
    let key = newUniRef.key;
    let uniCatRef = db.ref('/universities/' + key + '/categoryList');

    let categories = ["Course Reviews", "Major Reviews", "Unit Reviews", "Summer Unit Polls", "Questions", "University Guides"];
    for (let i = 0; i < categories.length; i++) {
        let cat = categoryModel(categories[i], key);
        let newCatRef = catRef.push(cat);
        uniCatRef.push(newCatRef.key);

    }

    return newUniRef.key;
}

const createThread = (title, content, uid, uname, categoryId) => {
    let thread = threadModel(title, content, uid, uname, categoryId);
    let newThreadRef = threadRef.push(thread);
    let key = newThreadRef.key;

    // Update the category
    catRef.child(categoryId).once('value', (snapshot) => {
        console.log(snapshot.val());
        if (!snapshot.val().threadExists) {
            catRef.child(categoryId).update({'threadExists': true});
        }
        catRef.child(categoryId).update({'threads': snapshot.val().threads + 1})
    })
    let catThreadRef = db.ref('/categories/' + categoryId + '/threadList');
    catThreadRef.push(key);

    return key;
}

const createComment = (content, uid, uname, threadId) => {
    let comment = commentModel(content, uid, uname, threadId);
    let newCommentRef = commentRef.push(comment);
    let key = newCommentRef.key;

    // Update the thread
    threadRef.child(threadId).once('value', (snapshot) => {
        if (!snapshot.val().hasComment) {
            threadRef.child(threadId).update({'hasComment': true});
        }
        threadRef.child(threadId).update({'comments': (snapshot.val().comments + 1)})
        threadRef.child(threadId).update({'lastReplyTimeStamp': (Date.parse(new Date().toString()))})
    })
    let threadCommentRef = db.ref('/threads/' + threadId + '/commentList');
    threadCommentRef.push(key);

    return key;
}

const getUniversities = () => {
    let unis = [];
    uniRef.once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            unis.push({key: child.key, val: child.val()});
        })
    })
    return(unis);
}


export {uniRef, catRef, commentRef, threadRef, userRef, getUniversities, createUni, createThread, createComment}