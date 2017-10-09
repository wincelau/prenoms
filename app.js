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
var sexe = 'F';
var color = 'info';
var position = 0;

if(window.location.search.replace('?', '') == 'fille') {
    sexe = 'F';
}

var init = function() {
    prenoms = [];
    position = 0;
    favoris = {};

    $('#titre').removeClass('text-'+color);
    $('#progression_container').removeClass('text-'+color);
    $('#panier_container').removeClass('text-'+color);
    $('#btn_precedent').removeClass('btn-'+color);
    $('#btn_suivant').removeClass('btn-'+color);

    if(sexe == 'F') {
        color = 'info';
    }
    if(sexe == 'M') {
        color = 'success';
    }

    if(localStorage.getItem("favoris_"+sexe)) {
        favoris = JSON.parse(localStorage.getItem("favoris_"+sexe));
    }
    prenoms_presentes = []
    if(localStorage.getItem("presentes_"+sexe)) {
        prenoms_presentes = JSON.parse(localStorage.getItem("presentes_"+sexe));
    }
    $('#titre').addClass('text-'+color);
    $('#progression_container').addClass('text-'+color);
    $('#panier_container').addClass('text-'+color);
    $('#btn_precedent').addClass('btn-'+color);
    $('#btn_suivant').addClass('btn-'+color);

    if(sexe == "F") {
        $('#titre').html('Fille');
    } else {
        $('#titre').html('Garçon');
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
            updateFavoris();
            updateStats();
            if(prenoms_presentes.length < nb_prenoms_propose) {
                nouvelleListe();
            }
            displayListe();
        }
    });
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
        updateFavoris();
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

var updateStats = function() {
    var pourcentage = (prenoms_presentes.length * 100 / prenoms.length);
    $('#progression').html(pourcentage.toFixed(1).replace(".", ","));
}

var updateFavoris = function() {
    var nbFavoris = 0;
    for(prenom in favoris) {
        nbFavoris++;
    }

    $('#panier').html((nbFavoris));
}

var nouvelleListe = function() {
    $('#liste_prenoms .liste_prenoms_item').addClass('disabled');

    var listeATirer = prenoms.filter(function(prenom) {

        return prenoms_presentes.indexOf(prenom) === -1;
    });

    for (i = 1; i <= nb_prenoms_propose; i++) {
        var prenom = tirageAuSort(listeATirer);
        if(prenom) {
            prenoms_presentes.push(prenom);
        }
    }

    localStorage.setItem("presentes_"+sexe, JSON.stringify(prenoms_presentes));

    updateStats();
}

var displayListe = function() {
    var positionInListe = (prenoms_presentes.length - 1) - (position * nb_prenoms_propose);

    $('#liste_prenoms').html(null);
    for(i = positionInListe ; i > positionInListe - nb_prenoms_propose; i--) {
        var prenom = prenoms_presentes[i];
        if(prenom) {
            var isFavoris = (favoris[prenom]) ? true : false;
            var element = $("<a href='javascript:void(0)' style='margin-bottom: 10px;' class='btn btn-block btn-lg btn-light liste_prenoms_item text-left'></a>");
            element.attr('data-prenom', prenom);
            if(isFavoris) {
                element.html('<i style="font-size: 30px;" class="material-icons float-right">favorite</i>');
                element.addClass('btn-'+color);
                element.removeClass('btn-light');
            }
            element.html(element.html()+prenom);
            $('#liste_prenoms').append(element);
        }
    }
}

init();

$('#btn_suivant').on('click', function(e) {
    e.preventDefault();
    $(this).hide();
    if(position == 0) {
        nouvelleListe();
    }
    if(position > 0) {
        position = position - 1;
    }
    if(position == 0) {
        //$('#btn_suivant .material-icons').css('font-size', '130px');
        $('#btn_suivant').css('opacity', 0.8);
        //$('#btn_suivant').css('margin-top', 0);
    }
    displayListe();
    $(this).show();
})

$('#btn_precedent').on('click', function(e) {
    e.preventDefault();
    position = position + 1;
    $(this).hide();
    displayListe();
    //$('#btn_suivant .material-icons').css('font-size', $('#btn_precedent .material-icons').css('font-size'));
    $('#btn_suivant').css('opacity', $('#btn_precedent').css('opacity'));
    //$('#btn_suivant').css('margin-top', $('#btn_precedent').css('margin-top'));
    $(this).show();
})

$('#liste_prenoms').on('click', '.liste_prenoms_item', function(e) {
    if(miseEnFavoris($(this).attr('data-prenom'))) {
        $(this).addClass('btn-'+color);
        $(this).removeClass('btn-light');
        $(this).html('<i style="font-size: 30px;" class="material-icons float-right">favorite</i>' + $(this).attr('data-prenom'));
    } else {
        $(this).addClass('btn-light');
        $(this).removeClass('btn-'+color);
        $(this).html($(this).attr('data-prenom'));
    }

    $(this).removeClass('active');

    $(this).blur();

    return false;
});

$('#titre').on('click', function(e) {
    if(sexe == "F") {
        sexe = "M";
    } else {
        sexe = "F";
    }
    init();
});
