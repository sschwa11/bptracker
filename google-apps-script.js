const SHEET_NAME = 'Data';

function doGet(e) {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify({ users: [] }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const users = [];

    for (let i = 1; i < headers.length; i++) {
        const username = headers[i];
        if (!username) continue;

        const userBlueprints = {};
        for (let r = 1; r < data.length; r++) {
            const blueprintId = data[r][0];
            const status = data[r][i];
            if (blueprintId) {
                userBlueprints[blueprintId] = status;
            }
        }

        users.push({
            name: username,
            blueprints: userBlueprints
        });
    }

    return ContentService.createTextOutput(JSON.stringify({ users: users }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const action = params.action;

        if (action === 'addUser') {
            return addUser(params.name);
        } else if (action === 'removeUser') {
            return removeUser(params.name);
        } else if (action === 'updateBlueprint') {
            return updateBlueprint(params.name, params.blueprintId, params.status);
        } else if (action === 'setAll') {
            return setAll(params.name, params.status);
        }

        return errorResponse('Invalid action');

    } catch (err) {
        return errorResponse(err.toString());
    }
}

function addUser(name) {
    if (!name) return errorResponse('Name is required');
    const sheet = getOrCreateSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];

    if (headers.includes(name)) {
        return successResponse('User already exists');
    }

    const lastCol = sheet.getLastColumn();
    let targetCol = lastCol + 1;
    if (lastCol === 0) targetCol = 2;

    sheet.getRange(1, targetCol).setValue(name);
    return successResponse('User added');
}

function removeUser(name) {
    const sheet = getOrCreateSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const index = headers.indexOf(name);

    if (index === -1) return errorResponse('User not found');

    sheet.deleteColumn(index + 1);
    return successResponse('User removed');
}

function updateBlueprint(user, blueprintId, status) {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const userIndex = headers.indexOf(user);
    if (userIndex === -1) return errorResponse('User not found');

    let rowIndex = -1;
    for (let r = 1; r < data.length; r++) {
        if (data[r][0] === blueprintId) {
            rowIndex = r;
            break;
        }
    }

    if (rowIndex === -1) {
        sheet.appendRow([blueprintId]);
        const newRow = sheet.getLastRow();
        sheet.getRange(newRow, userIndex + 1).setValue(status);
    } else {
        sheet.getRange(rowIndex + 1, userIndex + 1).setValue(status);
    }

    return successResponse('Updated');
}

function setAll(user, status) {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const userIndex = headers.indexOf(user);
    if (userIndex === -1) return errorResponse('User not found');

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return successResponse('No blueprints to update');

    const updates = [];
    for (let i = 0; i < lastRow - 1; i++) {
        updates.push([status]);
    }

    sheet.getRange(2, userIndex + 1, lastRow - 1, 1).setValues(updates);
    return successResponse('Bulk updated');
}

function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        sheet.getRange(1, 1).setValue('Blueprint_ID');
    }
    return sheet;
}

function successResponse(msg) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}
