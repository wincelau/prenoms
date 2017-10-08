/* OPTIONS */
var fichier = "data/prenoms_france.csv";
var nb_points_choisi = 1;
var nb_points_non_choisi = -0.5;
var nb_points_aucun = -1;
var nb_prenoms_propose = 5;
var aucun_possible = true;
var nb_point_defaut = 0;
var nb_point_to_hide = -2;
var nb_point_max = 2;
var nb_tirage_per_points = 2;
var nb_tirage_defaut = Math.abs(nb_point_to_hide) * (nb_tirage_per_points) * 2;
/* FIN DES OPTIONS */

var prenoms = [];
var prenoms_presentes = [];
var favoris = {};
var choisi = {};
var sexe = 'M';

if(window.location.search.replace('?', '') == 'fille') {
    sexe = 'F';
}

if(localStorage.getItem("favoris_"+sexe)) {
    favoris = JSON.parse(localStorage.getItem("favoris_"+sexe));
}
if(localStorage.getItem("presentes_"+sexe)) {
    prenoms_presentes = JSON.parse(localStorage.getItem("presentes_"+sexe));
}

Papa.parse(fichier, {
    download: true,
    step: function(row) {
        if(row.data[0][0] == sexe && row.data[0][1].trim()) {
            prenoms.push(row.data[0][1].trim());
        }
    },
    complete: function() {
        $('#loader').hide();
        $('#content').removeClass('d-none');
        init();
    }
});

var sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var init = function() {
    updatePanier();
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

var miseEnFavoris = function(prenom) {

    var ajout = true;
    $('#panier_container').animate({'opacity': 1}, 500, function() {
        updatePanier();
        $('#panier_container').animate({'opacity': 0.5}, 500);
    });

    if(!favoris[prenom]) {
        favoris[prenom] = 1;
    } else {
        delete favoris[prenom];
        ajout = false;
    }

    localStorage.setItem("favoris_"+sexe, JSON.stringify(favoris));

    return ajout;
}

var updatePanier = function() {
    var nbFavoris = 0;
    for(prenom in favoris) {
        nbFavoris++;
    }

    $('#panier').html((nbFavoris));
}

var nouvelleListe = function() {
    $('#liste_prenoms .liste_prenoms_item').each(function() {
        prenoms_presentes.push($(this).attr('data-prenom'));
    });

    localStorage.setItem("presentes_"+sexe, JSON.stringify(prenoms_presentes));

    $('#liste_prenoms .liste_prenoms_item').addClass('disabled');

    var listeATirer = prenoms.filter(function(prenom) {

        return prenoms_presentes.indexOf(prenom) === -1;
    });

    $('#liste_prenoms').html(null);
    for (i = 1; i <= nb_prenoms_propose; i++) {
        setPrenomsInListe(listeATirer);
    }
    var pourcentage = (prenoms_presentes.length * 100 / prenoms.length);

    $('#progression').html(pourcentage.toFixed(1).replace(".", ","));
}

var setPrenomsInListe = function(listeATirer) {
    var prenom = tirageAuSort(listeATirer);

    if(!prenom) {
        return;
    }

    var isFavoris = (favoris[prenom]) ? true : false;
    var element = $("<a href='javascript:void(0)' style='margin-bottom: 10px;' class='btn btn-block btn-lg btn-light liste_prenoms_item text-left'></a>");
    element.attr('data-prenom', prenom);
    if(isFavoris) {
        element.html('<i style="font-size: 30px;" class="material-icons float-right">favorite</i>');
    }
    element.html(element.html()+prenom);
    $('#liste_prenoms').append(element);
}

$('#btn_suivant').on('click', function(e) {
    e.preventDefault();
    $(this).hide();
    nouvelleListe();
    $(this).show();
})

$('#liste_prenoms').on('click', '.liste_prenoms_item', function(e) {

    if(miseEnFavoris($(this).attr('data-prenom'))) {
        $(this).addClass('btn-info');
        $(this).removeClass('btn-light');
        $(this).html('<i style="font-size: 30px;" class="material-icons float-right">favorite</i>' + $(this).attr('data-prenom'));
    } else {
        $(this).addClass('btn-light');
        $(this).removeClass('btn-info');
        $(this).html($(this).attr('data-prenom'));
    }

    $(this).removeClass('active');

    $(this).blur();

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
