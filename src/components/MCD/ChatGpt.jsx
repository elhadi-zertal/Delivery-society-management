"use client"
import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const ChatGpt = () => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">MCD - Système de Transport & Livraison </h1>
        <p className="text-sm text-gray-600 mt-1">Modèle Conceptuel de Données — Chat Gpt</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg viewBox="0 0 1800 1600" className="w-full" style={{ maxWidth: '1800px' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>

            {/* ENTITÉS */}

            {/* Client */}
            <g>
              <rect x="50" y="650" width="180" height="210" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="140" y="675" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">CLIENT</text>
              <line x1="50" y1="685" x2="230" y2="685" stroke="white" strokeWidth="2"/>
              <text x="60" y="705" fill="white" fontSize="13">• id_client</text>
              <text x="60" y="725" fill="white" fontSize="13">• nom</text>
              <text x="60" y="750" fill="white" fontSize="13">• prénom</text>
              <text x="60" y="775" fill="white" fontSize="13">• téléphone</text>
              <text x="60" y="800" fill="white" fontSize="13">• email</text>
              <text x="60" y="825" fill="white" fontSize="13">• adresse</text>
              <text x="60" y="850" fill="white" fontSize="13">• solde</text>
            </g>

            {/* Utilisateur / Agent */}
            <g>
              <rect x="260" y="500" width="220" height="160" fill="#06B6D4" stroke="#056F72" strokeWidth="2" rx="8"/>
              <text x="370" y="525" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">UTILISATEUR</text>
              <line x1="260" y1="535" x2="480" y2="535" stroke="white" strokeWidth="2"/>
              <text x="270" y="555" fill="white" fontSize="13">• id_user</text>
              <text x="270" y="575" fill="white" fontSize="13">• nom</text>
              <text x="270" y="595" fill="white" fontSize="13">• email</text>
              <text x="270" y="615" fill="white" fontSize="13">• mot_de_passe</text>
              <text x="270" y="635" fill="white" fontSize="13">• rôle</text>
            </g>

            {/* Véhicule */}
            <g>
              <rect x="1250" y="270" width="200" height="220" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="1350" y="295" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">VEHICULE</text>
              <line x1="1250" y1="305" x2="1450" y2="305" stroke="white" strokeWidth="2"/>
              <text x="1260" y="325" fill="white" fontSize="13">• id_vehicule</text>
              <text x="1260" y="345" fill="white" fontSize="13">• immatriculation</text>
              <text x="1260" y="365" fill="white" fontSize="13">• type</text>
              <text x="1260" y="385" fill="white" fontSize="13">• capacité_poids</text>
              <text x="1260" y="405" fill="white" fontSize="13">• capacité_volume</text>
              <text x="1260" y="425" fill="white" fontSize="13">• consommation</text>
              <text x="1260" y="445" fill="white" fontSize="13">• état</text>
              <text x="1260" y="465" fill="white" fontSize="13">• date_acquisition</text>
            </g>

            {/* Chauffeur */}
            <g>
              <rect x="890" y="50" width="180" height="220" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="980" y="75" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">CHAUFFEUR</text>
              <line x1="890" y1="85" x2="1070" y2="85" stroke="white" strokeWidth="2"/>
              <text x="900" y="105" fill="white" fontSize="13">• id_chauffeur</text>
              <text x="900" y="125" fill="white" fontSize="13">• nom</text>
              <text x="900" y="145" fill="white" fontSize="13">• prénom</text>
              <text x="900" y="165" fill="white" fontSize="13">• num_permis</text>
              <text x="900" y="185" fill="white" fontSize="13">• téléphone</text>
              <text x="900" y="205" fill="white" fontSize="13">• email</text>
              <text x="900" y="225" fill="white" fontSize="13">• disponibilité</text>
              <text x="900" y="245" fill="white" fontSize="13">• date_embauche</text>
            </g>

            {/* Destination */}
            <g>
              <rect x="500" y="50" width="180" height="180" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="590" y="75" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">DESTINATION</text>
              <line x1="500" y1="85" x2="680" y2="85" stroke="white" strokeWidth="2"/>
              <text x="510" y="105" fill="white" fontSize="13">• id_destination</text>
              <text x="510" y="125" fill="white" fontSize="13">• ville</text>
              <text x="510" y="145" fill="white" fontSize="13">• pays</text>
              <text x="510" y="165" fill="white" fontSize="13">• zone_géo</text>
              <text x="510" y="185" fill="white" fontSize="13">• code_postal</text>
              <text x="510" y="205" fill="white" fontSize="13">• tarif_base</text>
            </g>

            {/* Type Service (sans tarifs spécifiques) */}
            <g>
              <rect x="50" y="400" width="180" height="140" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="140" y="425" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TYPE_SERVICE</text>
              <line x1="50" y1="435" x2="230" y2="435" stroke="white" strokeWidth="2"/>
              <text x="60" y="455" fill="white" fontSize="13">• id_type_service</text>
              <text x="60" y="475" fill="white" fontSize="13">• libellé</text>
              <text x="60" y="495" fill="white" fontSize="13">• description</text>
              <text x="60" y="515" fill="white" fontSize="13">• délai_estimé</text>
            </g>

            {/* Tarification (nouvelle entité) */}
            <g>
              <rect x="260" y="50" width="260" height="160" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="2" rx="8"/>
              <text x="390" y="75" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TARIFICATION</text>
              <line x1="260" y1="85" x2="520" y2="85" stroke="white" strokeWidth="2"/>
              <text x="270" y="105" fill="white" fontSize="13">• id_tarification</text>
              <text x="270" y="125" fill="white" fontSize="13">• tarif_poids</text>
              <text x="270" y="145" fill="white" fontSize="13">• tarif_volume</text>
              <text x="270" y="165" fill="white" fontSize="13">• tarif_base (optionnel)</text>
            </g>

            {/* Expédition */}
            <g>
              <rect x="500" y="400" width="220" height="260" fill="#10B981" stroke="#059669" strokeWidth="2" rx="8"/>
              <text x="610" y="425" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">EXPEDITION</text>
              <line x1="500" y1="435" x2="720" y2="435" stroke="white" strokeWidth="2"/>
              <text x="510" y="455" fill="white" fontSize="13">• id_expedition</text>
              <text x="510" y="475" fill="white" fontSize="13">• num_expedition</text>
              <text x="510" y="495" fill="white" fontSize="13">• date_creation</text>
              <text x="510" y="515" fill="white" fontSize="13">• poids</text>
              <text x="510" y="535" fill="white" fontSize="13">• volume</text>
              <text x="510" y="555" fill="white" fontSize="13">• description</text>
              <text x="510" y="575" fill="white" fontSize="13">• montant_total (calculé)</text>
              <text x="510" y="595" fill="white" fontSize="13">• statut</text>
              <text x="510" y="615" fill="white" fontSize="13">• adresse_enlevement</text>
              <text x="510" y="635" fill="white" fontSize="13">• adresse_livraison</text>
            </g>

            {/* Tournée */}
            <g>
              <rect x="970" y="400" width="200" height="220" fill="#10B981" stroke="#059669" strokeWidth="2" rx="8"/>
              <text x="1070" y="425" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TOURNEE</text>
              <line x1="970" y1="435" x2="1170" y2="435" stroke="white" strokeWidth="2"/>
              <text x="980" y="455" fill="white" fontSize="13">• id_tournee</text>
              <text x="980" y="475" fill="white" fontSize="13">• date_tournee</text>
              <text x="980" y="495" fill="white" fontSize="13">• heure_depart</text>
              <text x="980" y="515" fill="white" fontSize="13">• heure_retour</text>
              <text x="980" y="535" fill="white" fontSize="13">• kilometrage</text>
              <text x="980" y="555" fill="white" fontSize="13">• durée</text>
              <text x="980" y="575" fill="white" fontSize="13">• consommation</text>
              <text x="980" y="595" fill="white" fontSize="13">• statut</text>
            </g>

            {/* Facture */}
            <g>
              <rect x="500" y="1000" width="180" height="200" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" rx="8"/>
              <text x="590" y="1025" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">FACTURE</text>
              <line x1="500" y1="1035" x2="680" y2="1035" stroke="white" strokeWidth="2"/>
              <text x="510" y="1055" fill="white" fontSize="13">• id_facture</text>
              <text x="510" y="1075" fill="white" fontSize="13">• num_facture</text>
              <text x="510" y="1095" fill="white" fontSize="13">• date_facture</text>
              <text x="510" y="1115" fill="white" fontSize="13">• montant_HT</text>
              <text x="510" y="1135" fill="white" fontSize="13">• montant_TVA</text>
              <text x="510" y="1155" fill="white" fontSize="13">• montant_TTC</text>
              <text x="510" y="1175" fill="white" fontSize="13">• statut</text>
            </g>

            {/* Paiement */}
            <g>
              <rect x="970" y="1000" width="180" height="180" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" rx="8"/>
              <text x="1060" y="1025" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">PAIEMENT</text>
              <line x1="970" y1="1035" x2="1150" y2="1035" stroke="white" strokeWidth="2"/>
              <text x="980" y="1055" fill="white" fontSize="13">• id_paiement</text>
              <text x="980" y="1075" fill="white" fontSize="13">• date_paiement</text>
              <text x="980" y="1095" fill="white" fontSize="13">• montant</text>
              <text x="980" y="1115" fill="white" fontSize="13">• mode_paiement</text>
              <text x="980" y="1135" fill="white" fontSize="13">• référence</text>
              <text x="980" y="1155" fill="white" fontSize="13">• statut</text>
            </g>

            {/* Incident */}
            <g>
              <rect x="1250" y="600" width="200" height="200" fill="#EF4444" stroke="#DC2626" strokeWidth="2" rx="8"/>
              <text x="1350" y="625" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">INCIDENT</text>
              <line x1="1250" y1="635" x2="1450" y2="635" stroke="white" strokeWidth="2"/>
              <text x="1260" y="655" fill="white" fontSize="13">• id_incident</text>
              <text x="1260" y="675" fill="white" fontSize="13">• type_incident</text>
              <text x="1260" y="695" fill="white" fontSize="13">• date_incident</text>
              <text x="1260" y="715" fill="white" fontSize="13">• description</text>
              <text x="1260" y="735" fill="white" fontSize="13">• gravité</text>
              <text x="1260" y="755" fill="white" fontSize="13">• statut</text>
              <text x="1260" y="775" fill="white" fontSize="13">• résolution</text>
            </g>

            {/* Réclamation */}
            <g>
              <rect x="50" y="1000" width="200" height="200" fill="#F59E0B" stroke="#D97706" strokeWidth="2" rx="8"/>
              <text x="150" y="1025" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">RECLAMATION</text>
              <line x1="50" y1="1035" x2="250" y2="1035" stroke="white" strokeWidth="2"/>
              <text x="60" y="1055" fill="white" fontSize="13">• id_reclamation</text>
              <text x="60" y="1075" fill="white" fontSize="13">• date_reclamation</text>
              <text x="60" y="1095" fill="white" fontSize="13">• nature</text>
              <text x="60" y="1115" fill="white" fontSize="13">• description</text>
              <text x="60" y="1135" fill="white" fontSize="13">• statut</text>
              <text x="60" y="1155" fill="white" fontSize="13">• date_resolution</text>
              <text x="60" y="1175" fill="white" fontSize="13">• action_corrective</text>
            </g>

            {/* RELATIONS */}

            {/* PASSER (Client - Expédition) */}
            <line x1="230" y1="730" x2="500" y2="530" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="365" cy="630" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="365" y="635" textAnchor="middle" fontSize="14" fontWeight="bold">PASSER</text>
            <text x="245" y="720" fontSize="12" fill="#374151">1,n</text>
            <text x="480" y="520" fontSize="12" fill="#374151">1,1</text>

            {/* APPLIQUER (Expédition - Tarification) */}
            <line x1="600" y1="480" x2="420" y2="190" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="510" cy="335" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="510" y="340" textAnchor="middle" fontSize="14" fontWeight="bold">APPLIQUER</text>
            <text x="620" y="490" fontSize="12" fill="#374151">1,1</text>
            <text x="420" y="200" fontSize="12" fill="#374151">1,1</text>

            {/* DESTINER (Expédition - Destination) */}
            <line x1="590" y1="400" x2="590" y2="230" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="590" cy="315" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="590" y="320" textAnchor="middle" fontSize="14" fontWeight="bold">DESTINER</text>
            <text x="600" y="390" fontSize="12" fill="#374151">1,n</text>
            <text x="600" y="240" fontSize="12" fill="#374151">1,1</text>

            {/* INCLURE (Tournée - Expédition) — corrigé: tournée 1,n ; expédition 0,1 */}
            <line x1="970" y1="510" x2="720" y2="510" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="845" cy="510" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="845" y="515" textAnchor="middle" fontSize="14" fontWeight="bold">INCLURE</text>
            <text x="930" y="505" fontSize="12" fill="#374151">1,n</text>
            <text x="740" y="505" fontSize="12" fill="#374151">0,1</text>

            {/* EFFECTUER (Chauffeur - Tournée) */}
            <line x1="980" y1="270" x2="1070" y2="400" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1025" cy="335" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1025" y="340" textAnchor="middle" fontSize="14" fontWeight="bold">EFFECTUER</text>
            <text x="1000" y="280" fontSize="12" fill="#374151">1,n</text>
            <text x="1080" y="395" fontSize="12" fill="#374151">1,1</text>

            {/* UTILISER (Tournée - Véhicule) */}
            <line x1="1170" y1="450" x2="1250" y2="380" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1210" cy="415" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1210" y="420" textAnchor="middle" fontSize="14" fontWeight="bold">UTILISER</text>
            <text x="1180" y="445" fontSize="12" fill="#374151">1,n</text>
            <text x="1230" y="375" fontSize="12" fill="#374151">1,1</text>

            {/* FACTURER (Client - Facture) */}
            <line x1="140" y1="860" x2="500" y2="1100" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="320" cy="980" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="320" y="985" textAnchor="middle" fontSize="14" fontWeight="bold">FACTURER</text>
            <text x="160" y="870" fontSize="12" fill="#374151">1,n</text>
            <text x="480" y="1095" fontSize="12" fill="#374151">1,1</text>

            {/* REGROUPER (Facture - Expédition) — corrigé: facture 1,n ; expédition 1,1 */}
            <line x1="590" y1="1000" x2="600" y2="660" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="595" cy="830" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="595" y="835" textAnchor="middle" fontSize="14" fontWeight="bold">REGROUPER</text>
            <text x="570" y="990" fontSize="12" fill="#374151">1,n</text>
            <text x="610" y="670" fontSize="12" fill="#374151">1,1</text>

            {/* REGLER (Paiement - Facture) */}
            <line x1="970" y1="1090" x2="680" y2="1090" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="825" cy="1090" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="825" y="1095" textAnchor="middle" fontSize="14" fontWeight="bold">REGLER</text>
            <text x="950" y="1085" fontSize="12" fill="#374151">0,n</text>
            <text x="690" y="1085" fontSize="12" fill="#374151">1,1</text>

            {/* CONCERNER_INC (Incident - Expédition) */}
            <line x1="1250" y1="700" x2="700" y2="600" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="975" cy="650" rx="75" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="975" y="655" textAnchor="middle" fontSize="13" fontWeight="bold">CONCERNER</text>
            <text x="1230" y="695" fontSize="12" fill="#374151">0,n</text>
            <text x="710" y="595" fontSize="12" fill="#374151">0,1</text>

            {/* AFFECTER (Incident - Tournée) */}
            <line x1="1250" y1="680" x2="1170" y2="550" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1210" cy="615" rx="65" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1210" y="620" textAnchor="middle" fontSize="14" fontWeight="bold">AFFECTER</text>
            <text x="1230" y="675" fontSize="12" fill="#374151">0,n</text>
            <text x="1180" y="555" fontSize="12" fill="#374151">0,1</text>

            {/* DEPOSER (Client - Réclamation) */}
            <line x1="140" y1="860" x2="150" y2="1000" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="145" cy="930" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="145" y="935" textAnchor="middle" fontSize="14" fontWeight="bold">DEPOSER</text>
            <text x="160" y="870" fontSize="12" fill="#374151">1,n</text>
            <text x="165" y="995" fontSize="12" fill="#374151">1,1</text>

            {/* PORTER_SUR (Réclamation - Expédition) */}
            <line x1="250" y1="1100" x2="500" y2="630" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="375" cy="865" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="375" y="870" textAnchor="middle" fontSize="13" fontWeight="bold">PORTER_SUR</text>
            <text x="265" y="1095" fontSize="12" fill="#374151">0,n</text>
            <text x="480" y="640" fontSize="12" fill="#374151">0,n</text>

            {/* UTILISATEUR relations: CREER / ENREGISTRER / TRAITER / SIGNALER */}
            <line x1="370" y1="660" x2="520" y2="580" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="445" cy="620" rx="60" ry="22" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="445" y="625" textAnchor="middle" fontSize="12" fontWeight="bold">CREER</text>
            <text x="320" y="690" fontSize="12" fill="#374151">1,n</text>
            <text x="510" y="590" fontSize="12" fill="#374151">1,1</text>

            <line x1="350" y1="740" x2="560" y2="980" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="455" cy="860" rx="60" ry="22" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="455" y="865" textAnchor="middle" fontSize="12" fontWeight="bold">ENREGISTRER</text>
            <text x="320" y="760" fontSize="12" fill="#374151">1,n</text>
            <text x="565" y="970" fontSize="12" fill="#374151">1,1</text>

            <line x1="360" y1="740" x2="160" y2="1040" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="260" cy="890" rx="60" ry="22" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="260" y="895" textAnchor="middle" fontSize="12" fontWeight="bold">TRAITER</text>
            <text x="320" y="760" fontSize="12" fill="#374151">1,n</text>
            <text x="170" y="1020" fontSize="12" fill="#374151">0,1</text>

            <line x1="370" y1="520" x2="1260" y2="660" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="815" cy="590" rx="70" ry="22" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="815" y="595" textAnchor="middle" fontSize="12" fontWeight="bold">SIGNALER</text>
            <text x="330" y="530" fontSize="12" fill="#374151">1,n</text>
            <text x="1260" y="650" fontSize="12" fill="#374151">0,n</text>

            {/* Légende */}
            <g transform="translate(50, 50)">
              <text x="0" y="0" fontSize="16" fontWeight="bold" fill="#374151">Légende</text>
              <rect x="0" y="10" width="30" height="20" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1"/>
              <text x="35" y="25" fontSize="12" fill="#374151">Entités de base</text>

              <rect x="0" y="40" width="30" height="20" fill="#10B981" stroke="#059669" strokeWidth="1"/>
              <text x="35" y="55" fontSize="12" fill="#374151">Processus métier</text>

              <rect x="0" y="70" width="30" height="20" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="1"/>
              <text x="35" y="85" fontSize="12" fill="#374151">Gestion financière</text>

              <rect x="0" y="100" width="30" height="20" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
              <text x="35" y="115" fontSize="12" fill="#374151">Incidents</text>

              <rect x="0" y="130" width="30" height="20" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
              <text x="35" y="145" fontSize="12" fill="#374151">Réclamations</text>

              <rect x="0" y="160" width="30" height="20" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="1"/>
              <text x="35" y="175" fontSize="12" fill="#374151">Tarification</text>

              <rect x="0" y="190" width="30" height="20" fill="#06B6D4" stroke="#056F72" strokeWidth="1"/>
              <text x="35" y="205" fontSize="12" fill="#374151">Utilisateurs / Agents</text>

              <ellipse cx="15" cy="235" rx="15" ry="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
              <text x="35" y="240" fontSize="12" fill="#374151">Associations</text>
            </g>

          </svg>
        </div>
      </div>

      <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <ZoomIn size={18} />
            Zoom +
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <ZoomOut size={18} />
            Zoom -
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Réinitialiser
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ChatGpt;
