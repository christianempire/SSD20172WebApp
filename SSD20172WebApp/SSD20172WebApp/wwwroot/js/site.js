// Write your JavaScript code.
//var baseUrl = "http://52.226.131.0/api-arena/";
var baseUrl = "http://localhost:60650/";

var getSimpleSimulationPayload = function () {
  return {
    numExpertAgents: $("#numexp").val(),
    numNewAgents: $("#numnew").val()
  }
};

var getAdvancedSimulationPayload = function () {
};