/**
 * Finds largest dollar amount from email body.
 * Returns null if no dollar amount is found.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */
function getLargestAmount(message) {
  var regex = new RegExp(/([$]|(?:Rs)|(?:Gs{0,1}\.))\b([\.,\d]{1,})\b/, "gi");
  var bodyRegexed = regex.exec(message.getBody());

  return bodyRegexed[0];
}

/**
 * Determines date the email was received.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */
function getReceivedDate(message) {
  return message.getDate().toLocaleDateString();
}

/**
 * Determines expense description by joining sender name and message subject.
 *
 * @param {Message} message An email message.
 * @returns {String}
 */
function getExpenseDescription(message) {
  return message.getSubject();
}

/**
 * Determines most recent spreadsheet URL.
 * Returns null if no URL was previously submitted.
 *
 * @returns {String}
 */
function getSheetUrl() {
  /* Modifying to grab user Spreadsheet URL */
  return PropertiesService.getUserProperties().getProperty('SPREADSHEET_URL');
}