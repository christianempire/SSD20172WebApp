// MODAL

var showModalWelcome = function () {
  $("#header-modal-welcome").show()
  $("#body-modal-welcome").show()
  $("#footer-modal-welcome").show()
  $("#body-modal-manual").hide()
  $("#header-modal-manual").hide()
  $("#header-modal-cases").hide()
  $("#body-modal-cases").hide()
  $("#footer-modal-cases").hide()
  $("#main-modal").modal("show");
};

var showModalManual = function () {
  $("#header-modal-welcome").hide()
  $("#body-modal-welcome").hide()
  $("#footer-modal-welcome").show()
  $("#body-modal-manual").show()
  $("#header-modal-manual").show()
  $("#header-modal-cases").hide()
  $("#body-modal-cases").hide()
  $("#footer-modal-cases").hide()
  $("#main-modal").modal("show");
};

var showModalCases = function () {
  $("#header-modal-welcome").hide()
  $("#body-modal-welcome").hide()
  $("#footer-modal-welcome").hide()
  $("#body-modal-manual").hide()
  $("#header-modal-manual").hide()
  $("#header-modal-cases").show()
  $("#body-modal-cases").show()
  $("#footer-modal-cases").show()
  $("#main-modal").modal("show")
};

// PROXY

var baseUrl = "http://52.226.131.0/api-arena/";
//var baseUrl = "http://localhost:60650/";

var getSimpleSimulationPayload = function () {
  return {
    numExpertAgents: $("#numexp").val(),
    numNewAgents: $("#numnew").val()
  }
};

var getAdvancedSimulationPayload = function () {
  return {
    numExpertAgents: $("#numexp").val(),
    numNewAgents: $("#numnew").val(),
    totalServiceDuration: $("#TAM").val(),
    agentLunchDuration: $("#TR").val(),
    minAgentsDuringLunch: $("#minage").val(),
    meanArrivalTime: $("#TLP").val(),
    lowerTransferTime: $("#TTPI").val(),
    upperTransferTime: $("#TTPF").val(),
    expertAgentMeanServiceDuration: $("#TAE").val(),
    newAgentMeanServiceDuration: $("#TAN").val()
  }
};

var changeSimulationType = function (type) {
  if ($("#select-types").val() == "simple") {
    $("#form-advanced").hide()
  }
  else if ($("#select-types").val() == "advanced") {
    $("#form-advanced").show()
  }
};

// DATA VALIDATION

$(".only-number").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
    // Allow: Ctrl+A, Command+A
    (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
    // Allow: home, end, left, right, down, up
    (e.keyCode >= 35 && e.keyCode <= 40)) {
    // Let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
});