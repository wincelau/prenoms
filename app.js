/* OPTIONS */
var fichier = "prenoms.csv";
var nb_points_choisi = 1;
var nb_points_non_choisi = -0.5;
var nb_points_aucun = -1;
var nb_prenoms_propose = 5;
var aucun_possible = true;
var nb_point_defaut = 0;
var nb_point_to_hide = -2;
var nb_point_max = 2;
var nb_tirage_per_points = 50;
/* FIN DES OPTIONS */

var prenoms = [];
var choisi = {};
var sexe = 'F';

if(window.location.search.replace('?', '') == 'garcon') {
    sexe = 'M';
}
$('#nav_'+sexe).addClass('active');
if(localStorage.getItem(sexe)) {
    choisi = JSON.parse(localStorage.getItem(sexe));
}

Papa.parse(fichier, {
    download: true,
    step: function(row) {
        if(row.data[0][1] == sexe && row.data[0][0].trim()) {
            prenoms.push(row.data[0][0].trim());
        }
    },
    complete: function() {
        init();
    }
});

var sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var init = function() {
    $('#nav_'+sexe).html($('#nav_'+sexe).html() + " <small class='text-muted'>(" + prenoms.length + " prenoms)</small>");
    afficherClassement();
    nouvelleListe();
}

var getRandomIntInclusive = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min +1)) + min;
}

var tirageAuSort = function(tableau) {
    var index = getRandomIntInclusive(0, tableau.length -1);

    return tableau[index];
}

var choix = function(prenom) {
    $('#liste_prenoms .liste_prenoms_item').each(function() {
        var element_prenom = $(this).attr('data-prenom');

        if(element_prenom == "aucun") {
            return;
        }

        if(!choisi[element_prenom]) {
            choisi[element_prenom] = 0;
        }

        if(prenom == "aucun") {
            choisi[element_prenom] += nb_points_aucun;
        } else if(prenom == element_prenom) {
            choisi[element_prenom] += nb_points_choisi;
        } else {
            choisi[element_prenom] += nb_points_non_choisi;
        }
    });

    localStorage.setItem(sexe, JSON.stringify(choisi));
}

var nouvelleListe = function() {
    var listeATirer = [];

    $('#liste_prenoms .liste_prenoms_item').addClass('disabled');
    var nb_tirage_defaut = Math.abs(nb_point_to_hide) * nb_tirage_per_points;
    var nb_tirage_max = (nb_point_max * nb_tirage_per_points) + nb_tirage_defaut;

    for (i in prenoms) {
        var prenom = prenoms[i];
        var nb_exemplaire = nb_tirage_defaut;
        if(choisi[prenom]) {
            nb_exemplaire += choisi[prenom]*nb_tirage_per_points;
        }
        if(nb_exemplaire > nb_tirage_max) {
            nb_exemplaire = nb_tirage_max;
        }
        if(nb_exemplaire <= 0) {
            nb_exemplaire = 0;
        }
        for (j = 1; j <= nb_exemplaire; j++) {
            listeATirer.push(prenom);
        }
    }
    $('#liste_prenoms').html(null);
    for (i = 1; i <= nb_prenoms_propose; i++) {
        setPrenomsInListe(listeATirer);
    }

    if(aucun_possible && $('#liste_prenoms .liste_prenoms_item').length > 0) {
        $('#liste_prenoms').append("<a data-prenom='aucun' href='javascript:void(0)' class='list-group-item list-group-item-action liste_prenoms_item'><i><small>Aucun de la liste</small></i></a>")
    }

    if($('#liste_prenoms .liste_prenoms_item').length == 0) {
        $('#liste_prenoms').html("<p><i>Plus aucun prénom disponible</i></p>")
    }
}

var setPrenomsInListe = function(listeATirer) {
    var prenom = tirageAuSort(listeATirer);

    if(!prenom) {
        return;
    }

    var indexSearch = listeATirer.indexOf(prenom);
    while(indexSearch !== -1) {
        listeATirer.splice(indexSearch, 1);
        indexSearch = listeATirer.indexOf(prenom);
    };

    var point = null;
    if(choisi[prenom]) {
        point = choisi[prenom];
    }
    var couleur = "info";
    if(point > 0) {
        couleur = "success";
    }
    if(point < 0) {
        couleur = "danger";
    }

    var element = $("<a href='javascript:void(0)' class='list-group-item list-group-item-action liste_prenoms_item '></a>");
    element.attr('data-prenom', prenom);
    element.html(prenom);
    if(point !== null) {
        element.append(" <small class='float-right text-"+couleur+"' style='opacity: 0.5;'>" + point + " point(s)</small>");
    }
    $('#liste_prenoms').append(element);
}

var afficherClassement = function(nb_max = 10) {
    trierTableauClassement();
    $('#classement').html(null);
    var nb_prenoms = 0;
    for(prenom in choisi) {
        if(nb_prenoms < nb_max) {
            $('#classement').append("<li>"+prenom+" <small class='text-muted'>("+choisi[prenom] + " points)</small></li>");
        }
        nb_prenoms += 1;

    }

    $('#progression').html((nb_prenoms * 100 / prenoms.length).toFixed(2));
}

var trierTableauClassement = function() {
    var prenoms_trier = [];
    var choisis_trier = {};
    for(prenom in choisi) {
        prenoms_trier.push(((choisi[prenom] >= 0) ? "+" : "-")+(Math.abs(choisi[prenom])*100+"").padStart(10, "0")+ "_" + prenom);
    }
    prenoms_trier.sort(function(a, b){ return (a.match(/^-/) && b.match(/^-/)) ? a.localeCompare(b) : b.localeCompare(a) });

    for(i in prenoms_trier) {
        var prenom = prenoms_trier[i].replace(/^[0-9\.+-]+_/, "");
        choisis_trier[prenom] = choisi[prenom];
    }

    choisi = choisis_trier;
}

$('#liste_prenoms').on('click', '.liste_prenoms_item', function(e) {
    if($(this).hasClass('disabled')) {
        return false;
    }
    $(this).addClass("active");
    sleep(200).then(() => {
        choix($(this).attr('data-prenom'));
        nouvelleListe();
        afficherClassement();
        $("#classement_cacher_tout").hide();
        $("#classement_voir_tout").show();
    });
    return false;
});

$('#classement_voir_tout').on('click', function(e) {
    afficherClassement(99999);
    $(this).hide();
    $("#classement_cacher_tout").show();

    return false;
});

$('#classement_cacher_tout').on('click', function(e) {
    afficherClassement();
    $(this).hide();
    $("#classement_voir_tout").show();

    return false;
});

$('#effacer_les_scores').on('click', function(e) {
    if(!confirm("Étes vous sûr de vouloir effacer les scores ?")) {

        return false;
    }
    localStorage.removeItem(sexe);
    document.location.reload();
    return false;
});
