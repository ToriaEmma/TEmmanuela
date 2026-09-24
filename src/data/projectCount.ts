/** Nombre de projets annonce dans la navigation ("Projets [n]").
 *
 * Il etait ecrit en dur -- et fige a 14 -- dans NavBar, MobileSiteMenu et
 * DesktopSiteHeader, alors que la liste n'en contient que 13. Le 14e element
 * du ruban est "Archive", qui ouvre la galerie d'affiches : ce n'est pas un
 * projet, il ne doit pas etre compte.
 *
 * Volontairement isole dans son propre module plutot que derive de
 * ProjectsGrid : ce dernier importe le ruban WebGL, et l'importer depuis la
 * barre de navigation ferait entrer three.js dans le bundle de l'accueil.
 * A tenir a jour avec le tableau `projects` de ProjectsGrid / ProjectsList.
 */
export const PROJECT_COUNT = 13;
