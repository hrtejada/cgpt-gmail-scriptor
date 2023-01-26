var FIELDNAMES = ['Date', 'Amount', 'Description', 'Spreadsheet URL'];

/**
 * Creates the main card users see with form inputs to log expenses.
 * Form can be prefilled with values.
 *
 * @param {String[]} opt_prefills Default values for each input field.
 * @param {String} opt_status Optional status displayed at top of card.
 * @returns {Card}
 */
function createExpensesCard(opt_prefills, opt_status) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('Log Your Expense'));

  if (opt_status) {
    if (opt_status.indexOf('Error: ') == 0) {
      opt_status = '<font color=\'#FF0000\'>' + opt_status + '</font>';
    } else {
      opt_status = '<font color=\'#228B22\'>' + opt_status + '</font>';
    }
    var statusSection = CardService.newCardSection();
    statusSection.addWidget(CardService.newTextParagraph()
      .setText('<b>' + opt_status + '</b>'));
    card.addSection(statusSection);

    var clearAction = CardService.newAction()
      .setFunctionName('clearForm')
      .setParameters({'Status': opt_status});
  }
  else{
    var clearAction = CardService.newAction()
      .setFunctionName('clearForm')
      .setParameters({'Status': ''});
  }
  var formSection = createFormSection(CardService.newCardSection(),
                                      FIELDNAMES, opt_prefills);
  
  /* Clear Form Section Button */
  var clearButton = CardService.newTextButton()
    .setText("Clear")
    .setOnClickAction(clearAction);
  
  var buttonSet = CardService.newButtonSet()
    .addButton(clearButton);
  
  formSection.addWidget(buttonSet);
  card.addSection(formSection);
  
  /* New Section for Creating Spreadsheet */
  var newSheetSection = CardService.newCardSection();
  var sheetName = CardService.newTextInput()
    .setFieldName('Sheet Name')
    .setTitle('Sheet Name');
  var createExpensesSheet = CardService.newAction()
    .setFunctionName('createExpensesSheet');
  var newSheetButton = CardService.newTextButton()
    .setText('New Sheet')
    .setOnClickAction(createExpensesSheet);
  newSheetSection.addWidget(sheetName);
  newSheetSection.addWidget(CardService.newButtonSet().addButton(newSheetButton));
  card.addSection(newSheetSection);

  return card;
}

/**
 * Creates form section to be displayed on card.
 *
 * @param {CardSection} section The card section to which form items are added.
 * @param {String[]} inputNames Names of titles for each input field.
 * @param {String[]} opt_prefills Default values for each input field.
 * @returns {CardSection}
 */
function createFormSection(section, inputNames, opt_prefills) {
  for (var i = 0; i < inputNames.length; i++) {
    var widget = CardService.newTextInput()
      .setFieldName(inputNames[i])
      .setTitle(inputNames[i]);
    if (opt_prefills && opt_prefills[i]) {
      widget.setValue(opt_prefills[i]);
    }
    section.addWidget(widget);
  }

  /* Custom Buttons added by Hector */
  var onClickAction = CardService.newAction().setFunctionName('submitForm');
  var submitButton = CardService.newTextButton()
    .setText("Submit")
    .setOnClickAction(onClickAction);
  
  var buttonSet = CardService.newButtonSet()
    .addButton(submitButton);
  
  section.addWidget(buttonSet);

  return section;
}

/**
 * Logs form inputs into a spreadsheet given by URL from form.
 * Then displays edit card.
 *
 * @param {Event} e An event object containing form inputs and parameters.
 * @returns {Card}
 */
function submitForm(e) {
  var res = e['formInput'];

  try {
    FIELDNAMES.forEach(function(fieldName) {
      if (! res[fieldName]) {
        throw 'incomplete form';
      }
    });
    var sheet = SpreadsheetApp
      .openByUrl((res['Spreadsheet URL']))
      .getActiveSheet();
    sheet.appendRow(objToArray(res, FIELDNAMES.slice(0, FIELDNAMES.length - 1)));

    /* Historical saving of URL by Hector */
    PropertiesService.getUserProperties().setProperty('SPREADSHEET_URL',
      res['Spreadsheet URL']);

    return createExpensesCard(null, 'Logged expense successfully!').build();
  }
  catch (err) {
    if (err == 'Exception: Invalid argument: url') {
      err = 'Invalid URL';
      res['Spreadsheet URL'] = null;
    }

    PropertiesService.getUserProperties().setProperty('SPREADSHEET_URL',
      res['Spreadsheet URL']);
    return createExpensesCard(objToArray(res, FIELDNAMES), 'Error: ' + err).build();
  }
}

/**
 * Returns an array corresponding to the given object and desired ordering of keys.
 *
 * @param {Object} obj Object whose values will be returned as an array.
 * @param {String[]} keys An array of key names in the desired order.
 * @returns {Object[]}
 */
function objToArray(obj, keys) {
  return keys.map(function(key) {
    return obj[key];
  });
}

/**
 * Recreates the main card without prefilled data.
 *
 * @param {Event} e An event object containing form inputs and parameters.
 * @returns {Card}
 */
function clearForm(e) {
  return createExpensesCard(null, e['parameters']['Status']).build();
}
