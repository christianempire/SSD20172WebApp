// GLOBAL DATA / FLAGS
var simulations = [];
var currentSimulation = {};
var firstSimulationExecuted = false;
var currentSimulationSaved = false;

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

var saveSimulation = function () {
  if (jQuery.isEmptyObject(currentSimulation)) {
    return;
  }

  delete currentSimulation.simulationId;
  delete currentSimulation.createdOn;
  for (var i = 0; i < currentSimulation.agent.length; i++) {
    agent = currentSimulation.agent[i];
    delete agent.agentId;
    delete agent.simulationId;
    delete agent.simulation;
  }

  currentSimulation.description = $("#simulation-name").val();

  if (currentSimulation.description === "") {
    return;
  }

  $.ajax({
    url: baseUrl + "simulations/",
    data: JSON.stringify(currentSimulation),
    method: "POST",
    headers: { 'Content-type': 'application/json' },
    beforeSend: function () {
      swal({
        title: '<img src="/images/100.GIF" />',
        text: 'Guardando escenario...',
        allowOutsideClick: false,
        showConfirmButton: false
      });
    },
    success: function (response) {
      $("#main-modal").modal("hide");
      currentSimulationSaved = true;
      $("#simulation-name").val("");
      swal(
        'Éxito',
        'Escenario guardado correctamente.',
        'success'
      );
    },
    error: function (xhr) {
      swal(
        'Error',
        'El escenario no pudo guardarse debido a un error inesperado.',
        'error'
      );
      console.log(xhr);
    }
  });
}

var updateAndShowSimulations = function () {
  $.ajax({
    url: baseUrl + "simulations/",
    method: "GET",
    beforeSend: function () {
      swal({
        title: '<img src="/images/100.GIF" />',
        text: 'Obteniendo escenarios...',
        allowOutsideClick: false,
        showConfirmButton: false
      });
    },
    success: function (response) {
      if (Array.isArray(response)) {
        swal.close();
        simulations = response;
        updateCasesModalTable();
        if (response.length > 0) {
          showModalCases();
        } else {
          swal(
            'No hay escenarios',
            'Actualmente no hay escenarios disponibles para mostrar.',
            'info'
          );
        }
      } else {
        swal(
          'Error',
          'Los escenarios no pudieron obtenerse debido a un error inesperado.',
          'error'
        );
      }
    },
    error: function (xhr) {
      swal(
        'Error',
        'Los escenarios no pudieron obtenerse debido a un error inesperado.',
        'error'
      );
      console.log(xhr);
    }
  });
}

var deleteSimulation = function (simulationId) {
  swal({
    title: 'Confirmación',
    text: "Una vez eliminado el registro no se podrá recuperar. ¿Seguro que desea eliminarlo?",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí',
    cancelButtonText: "No"
  }).then((result) => {
    if (result.value) {
      $.ajax({
        url: baseUrl + "simulations/" + simulationId,
        method: "DELETE",
        beforeSend: function () {
          swal({
            title: '<img src="/images/100.GIF" />',
            text: 'Eliminando escenario...',
            allowOutsideClick: false,
            showConfirmButton: false
          });
        },
        success: function (response) {
          var index = 0;
          var found = false;
          while (!found && index < simulations.length) {
            if (simulations[index].simulationId === simulationId) {
              found = true;
            } else {
              index++;
            }
          }
          if (found) {
            simulations.splice(index, 1);
            updateCasesModalTable();
            if (simulations.length === 0) {
              $("#main-modal").modal("hide");
            }
          }
          swal(
            'Éxito',
            'Escenario eliminado correctamente.',
            'success'
          );
        },
        error: function (xhr) {
          swal(
            'Error',
            'El escenario no pudo eliminarse debido a un error inesperado.',
            'error'
          );
          console.log(xhr);
        }
      });
    }
  });
}

// MODALS

var showModalWelcome = function () {
  $("#header-modal-welcome").show();
  $("#body-modal-welcome").show();
  $("#footer-modal-welcome").show();
  $("#header-modal-manual").hide();
  $("#body-modal-manual").hide();
  $("#footer-modal-manual").hide();
  $("#header-modal-save").hide();
  $("#body-modal-save").hide();
  $("#footer-modal-save").hide();
  $("#header-modal-cases").hide();
  $("#body-modal-cases").hide();
  $("#footer-modal-cases").hide();
  $("#main-modal").modal("show");
};

var showModalManual = function () {
  $("#header-modal-welcome").hide();
  $("#body-modal-welcome").hide();
  $("#footer-modal-welcome").hide();
  $("#header-modal-manual").show();
  $("#body-modal-manual").show();
  $("#footer-modal-manual").show();
  $("#header-modal-save").hide();
  $("#body-modal-save").hide();
  $("#footer-modal-save").hide();
  $("#header-modal-cases").hide();
  $("#body-modal-cases").hide();
  $("#footer-modal-cases").hide();
  $("#main-modal").modal("show");
};

var showModalSave = function () {
  $("#header-modal-welcome").hide();
  $("#body-modal-welcome").hide();
  $("#footer-modal-welcome").hide();
  $("#header-modal-manual").hide();
  $("#body-modal-manual").hide();
  $("#footer-modal-manual").hide();
  $("#header-modal-save").show();
  $("#body-modal-save").show();
  $("#footer-modal-save").show();
  $("#header-modal-cases").hide();
  $("#body-modal-cases").hide();
  $("#footer-modal-cases").hide();
  $("#main-modal").modal("show");
};

var showModalCases = function () {
  $("#header-modal-welcome").hide();
  $("#body-modal-welcome").hide();
  $("#footer-modal-welcome").hide();
  $("#header-modal-manual").hide();
  $("#body-modal-manual").hide();
  $("#footer-modal-manual").hide();
  $("#header-modal-save").hide();
  $("#body-modal-save").hide();
  $("#footer-modal-save").hide();
  $("#header-modal-cases").show();
  $("#body-modal-cases").show();
  $("#footer-modal-cases").show();
  $("#main-modal").modal("show");
};

// CONFIGURATION

var changeSimulationType = function (type) {
  if ($("#select-types").val() == "simple") {
    $("#form-advanced").hide();
  }
  else if ($("#select-types").val() == "advanced") {
    $("#form-advanced").show();
  }
};

// VALIDATIONS

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

var attemptOpenSaveModal = function () {
  if (!firstSimulationExecuted) {
    swal(
      'Escenario no ejecutado',
      'Debe ejecutar un escenario antes de usar esta opción.',
      'info'
    );
  } else if (currentSimulationSaved) {
    swal(
      'Escenario ya guardado',
      'El escenario ya se encuentra guardado. Ejecute otro para volver a usar esta opción.',
      'info'
    );
  } else {
    showModalSave();
  }
};

// DATA DISPLAY AND MANIPULATION
var updateCasesModalTable = function () {
  $("#cases-table-body").html("");
  var simulationsClone = JSON.parse(JSON.stringify(simulations))
  var simulationsHtml = "";
  for (var i = 0; i < simulationsClone.length; i++) {
    simulation = simulationsClone[i];
    simulation.createdOn = simulation.createdOn.split("T")[0]
    simulationsHtml += Mustache.render($("#case-row-template").html(), simulation)
  }
  $("#cases-table-body").html(simulationsHtml);
};

var seeCaseDetails = function (caseId) {
  var found = false;
  var index = 0;
  var simulation;
  while (!found && index < simulations.length) {
    if (simulations[index].simulationId === caseId) {
      simulation = simulations[index]
      found = true
    } else {
      index++;
    }
  }
  if (found) {
    var simulationDataTransform = JSON.parse(JSON.stringify(simulation));
    simulationDataTransform.numExpertAgents = 0;
    simulationDataTransform.numNewAgents = 0;
    for (var i = 0; i < simulation.agent.length; i++) {
      var agent = simulation.agent[i];
      if (agent.isExpert) {
        simulationDataTransform.numExpertAgents += 1;
      } else {
        simulationDataTransform.numNewAgents += 1;
      }
    }
    var detailsHtml = Mustache.render($("#case-details-template").html(), simulationDataTransform);
    $("#case-details-table-body").html(detailsHtml);
    $("#secondary-modal").modal("show");
  }
};