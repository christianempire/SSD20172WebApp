// GLOBAL DATA / FLAGS
var simulations = [];
var displayedSimulationsIds = [];
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

var executeSimulation = function () {
  var payload = {}
  if ($("#select-types").val() === "simple") {
    payload = getSimpleSimulationPayload();
  }
  else if ($("#select-types").val() === "advanced") {
    payload = getAdvancedSimulationPayload();
  }
  else {
    return;
  }

  $.ajax({
    url: baseUrl + "run/" + $("#select-types").val(),
    data: payload,
    method: "GET",
    beforeSend: function () {
      swal({
        title: '<img src="/images/100.GIF" />',
        text: 'Ejecutando escenario...',
        allowOutsideClick: false,
        showConfirmButton: false
      });
    },
    success: function (response) {
      if (response !== null && response !== "" && response.status !== 400) {
        currentSimulation = response;
        drawSimulationsResults();
        firstSimulationExecuted = true;
        currentSimulationSaved = false;
        swal(
          'Éxito',
          'El escenario se ejecutó correctamente y ya puede ver los resultados.',
          'success'
        );
      } else {
        swal(
          'Error',
          'Hubo un error desconocido en la ejecución del escenario. Revise que halla completado todos los campos e inténtelo de nuevo.',
          'error'
        );
      }
    },
    error: function (xhr) {
      swal(
        'Error',
        'Hubo un error desconocido en la ejecución del escenario. Revise que halla completado todos los campos e inténtelo de nuevo.',
        'error'
      );
      console.log(xhr);
    }
  });
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
      currentSimulation = {};
      $("#simulation-name").val("");
      drawSimulationsResults();
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
        updateSimulationsModalTable();
        if (response.length > 0) {
          showModalSimulations();
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
    text: "Una vez eliminado el escenario no se podrá recuperar. ¿Seguro que desea eliminarlo?",
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
            $("#results-simulation-" + simulationId).hide();
            updateSimulationsModalTable();
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
  $("#header-modal-simulations").hide();
  $("#body-modal-simulations").hide();
  $("#footer-modal-simulations").hide();
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
  $("#header-modal-simulations").hide();
  $("#body-modal-simulations").hide();
  $("#footer-modal-simulations").hide();
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
  $("#header-modal-simulations").hide();
  $("#body-modal-simulations").hide();
  $("#footer-modal-simulations").hide();
  $("#main-modal").modal("show");
};

var showModalSimulations = function () {
  $("#header-modal-welcome").hide();
  $("#body-modal-welcome").hide();
  $("#footer-modal-welcome").hide();
  $("#header-modal-manual").hide();
  $("#body-modal-manual").hide();
  $("#footer-modal-manual").hide();
  $("#header-modal-save").hide();
  $("#body-modal-save").hide();
  $("#footer-modal-save").hide();
  $("#header-modal-simulations").show();
  $("#body-modal-simulations").show();
  $("#footer-modal-simulations").show();
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
var drawPieChart = function (rows, containerElementId) {
  var dataTable = new google.visualization.DataTable();

  dataTable.addColumn('string', 'Topping');
  dataTable.addColumn('number', 'Slices');
  dataTable.addRows(rows);

  var pieChartOptions = {
    title: 'Utilización promedio de agentes',
    width: 400,
    height: 300
  };

  var pieChart = new google.visualization.PieChart(document.getElementById(containerElementId));

  pieChart.draw(dataTable, pieChartOptions);
};

var drawBarChart = function (avgWaitingTime, avgTimeInSystem, containerElementId) {
  var dataTable = new google.visualization.DataTable();

  dataTable.addColumn('string', 'Topping');
  dataTable.addColumn('number', 'Slices');
  dataTable.addRows([
    ['Atención', avgWaitingTime * 60],
    ['En sistema', avgTimeInSystem]
  ]);

  var barChartOptions = {
    title: 'Tiempos promedios (minutos)',
    width: 400,
    height: 300,
    legend: 'none'
  };

  var barChart = new google.visualization.BarChart(document.getElementById(containerElementId));

  barChart.draw(dataTable, barChartOptions);
};

var drawSimulationsResults = function () {
  var simulationsResultsHtml = "";
  var simulationResults;

  if (!jQuery.isEmptyObject(currentSimulation)) {
    simulationResults = {};
    simulationResults.description = "Escenario actual";
    simulationResults.simulationId = "current";
    simulationResults.avgNumberInQueue = currentSimulation.avgNumberInQueue;
    simulationResults.maxNumberInQueue = currentSimulation.maxNumberInQueue;
    simulationsResultsHtml += Mustache.render($("#results-row-template").html(), simulationResults)
  }

  for (var i = 0; i < displayedSimulationsIds.length; i++) {
    var found = false;
    var index = 0;
    var simulation;
    while (!found && index < simulations.length) {
      if (displayedSimulationsIds[i] === simulations[index].simulationId) {
        simulation = JSON.parse(JSON.stringify(simulations[index]));
        found = true;
      } else {
        index++;
      }
    }
    if (found) {
      simulationResults = {};
      simulationResults.description = simulation.description;
      simulationResults.simulationId = simulation.simulationId;
      simulationResults.avgNumberInQueue = simulation.avgNumberInQueue;
      simulationResults.maxNumberInQueue = simulation.maxNumberInQueue;
      simulationsResultsHtml += Mustache.render($("#results-row-template").html(), simulationResults)
    }
  }

  $("#simulations-results").html(simulationsResultsHtml);

  var rows;

  if (!jQuery.isEmptyObject(currentSimulation)) {
    rows = [];
    var expertAgentsCount = 1;
    var newAgentsCount = 1;
    for (var i = 0; i < currentSimulation.agent.length; i++) {
      var agent = currentSimulation.agent[i];
      if (agent.isExpert) {
        rows.push(["E" + expertAgentsCount, agent.utilization]);
        expertAgentsCount++;
      } else {
        rows.push(["N" + newAgentsCount, agent.utilization]);
        newAgentsCount++;
      }
    }

    drawPieChart(rows, "piechart-simulation-current");
    drawBarChart(currentSimulation.avgWaitingTime, currentSimulation.avgTimeInSystem, "barchart-simulation-current");
  }

  for (var i = 0; i < displayedSimulationsIds.length; i++) {
    var found = false;
    var index = 0;
    var simulation;
    while (!found && index < simulations.length) {
      if (displayedSimulationsIds[i] === simulations[index].simulationId) {
        simulation = JSON.parse(JSON.stringify(simulations[index]));
        found = true;
      } else {
        index++;
      }
    }
    if (found) {
      rows = [];
      var expertAgentsCount = 1;
      var newAgentsCount = 1;
      for (var j = 0; j < simulation.agent.length; j++) {
        var agent = simulation.agent[j];
        if (agent.isExpert) {
          rows.push(["E" + expertAgentsCount, agent.utilization]);
          expertAgentsCount++;
        } else {
          rows.push(["N" + newAgentsCount, agent.utilization]);
          newAgentsCount++;
        }
      }

      drawPieChart(rows, "piechart-simulation-" + simulation.simulationId);
      drawBarChart(currentSimulation.avgWaitingTime, currentSimulation.avgTimeInSystem, "barchart-simulation-" + simulation.simulationId);
    }
  }
};

var updateDisplayedSimulationsIds = function () {
  displayedSimulationsIds = [];
  $(".button-toggle-simulation-display").each(function () {
    if ($(this).hasClass("display-simulation")) {
      displayedSimulationsIds.push(parseInt($(this).attr("simulationId")));
    }
  });
  drawSimulationsResults();
};

var updateSimulationsModalTable = function () {
  $("#simulations-table-body").html("");
  var simulationsClone = JSON.parse(JSON.stringify(simulations))
  var simulationsHtml = "";
  for (var i = 0; i < simulationsClone.length; i++) {
    simulation = simulationsClone[i];
    simulation.createdOn = simulation.createdOn.split("T")[0]
    simulationsHtml += Mustache.render($("#simulation-row-template").html(), simulation)
  }
  $("#simulations-table-body").html(simulationsHtml);
};

var seeSimulationDetails = function (simulationId) {
  var found = false;
  var index = 0;
  var simulation;
  while (!found && index < simulations.length) {
    if (simulations[index].simulationId === simulationId) {
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
    var detailsHtml = Mustache.render($("#simulation-details-template").html(), simulationDataTransform);
    $("#simulation-details-table-body").html(detailsHtml);
    $("#secondary-modal").modal("show");
  }
};

// MAIN

var main = function () {
  showModalWelcome();
};
$(document).ready(main);