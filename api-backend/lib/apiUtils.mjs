// import third party modules
import { StatusCodes } from "http-status-codes";

// import this package's modules
import { executeQuery } from "./dbUtils.mjs";
import { handleErrors } from "./errorUtils.mjs";
import { removePrivateFields } from "./jsonUtils.mjs";

// handles the output of the executeQuery() function
// transform is:
//     the function to be applied to "res" in order to transform 
//     it to the object that the API will send to the user (if needed)
//     null if not needed
// the function returns { status, response } which is what will be sent to the user
function handleQueryResponse({ res, err }, transform) {
    let status = undefined;
    let response = undefined;

    if (err) { // some error occured
        status = handleErrors(err);
    } else if (res.deletedCount !== undefined) { // query was a delete
        status = StatusCodes.NO_CONTENT;
    } else if (!res || res.length === 0) { // query was a find but no document was found
        status = StatusCodes.NOT_FOUND;
    } else { // query was a find and document(s) were found
        status = StatusCodes.OK;
        removePrivateFields(res);
        response = transform instanceof Function ? transform(res) : res;
    }
    return { status, response };
}

// handles the output of the createDocument() function
// the function returns "status" which is the status code of the response
function handleCreateResponse({ err }) {
    let status = undefined;

    if (err) { // some error occured
        status = handleErrors(err);
    } else { // save successful
        status = StatusCodes.NO_CONTENT;
    }
    return status;
}

async function documentExists(query) {
    const { res, err } = await executeQuery(query);
    const ans = (res != null);
    return { ans, err };
}

export { handleQueryResponse, handleCreateResponse, documentExists };
