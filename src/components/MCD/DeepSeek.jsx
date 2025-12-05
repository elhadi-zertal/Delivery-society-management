"use client"
import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const DeepSeek = () => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">MCD - Système de Transport & Livraison</h1>
        <p className="text-sm text-gray-600 mt-1">Modèle Conceptuel de Données - Version Complète - DeepSeek</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
          <svg viewBox="0 0 1800 1400" className="w-full" style={{ maxWidth: '1800px' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>

            {/* ENTITÉS */}
            
            {/* Client */}
            <g>
              <rect x="50" y="600" width="180" height="210" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="140" y="625" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">CLIENT</text>
              <line x1="50" y1="635" x2="230" y2="635" stroke="white" strokeWidth="2"/>
              <text x="60" y="655" fill="white" fontSize="13">• id_client</text>
              <text x="60" y="675" fill="white" fontSize="13">• nom</text>
              <text x="60" y="695" fill="white" fontSize="13">• prénom</text>
              <text x="60" y="715" fill="white" fontSize="13">• téléphone</text>
              <text x="60" y="735" fill="white" fontSize="13">• email</text>
              <text x="60" y="755" fill="white" fontSize="13">• adresse</text>
              <text x="60" y="775" fill="white" fontSize="13">• solde</text>
              <text x="60" y="795" fill="white" fontSize="13">• type_client</text>
            </g>

            {/* Véhicule */}
            <g>
              <rect x="1450" y="300" width="200" height="220" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="1550" y="325" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">VEHICULE</text>
              <line x1="1450" y1="335" x2="1650" y2="335" stroke="white" strokeWidth="2"/>
              <text x="1460" y="355" fill="white" fontSize="13">• id_vehicule</text>
              <text x="1460" y="375" fill="white" fontSize="13">• immatriculation</text>
              <text x="1460" y="395" fill="white" fontSize="13">• type</text>
              <text x="1460" y="415" fill="white" fontSize="13">• capacité_poids</text>
              <text x="1460" y="435" fill="white" fontSize="13">• capacité_volume</text>
              <text x="1460" y="455" fill="white" fontSize="13">• consommation</text>
              <text x="1460" y="475" fill="white" fontSize="13">• état</text>
              <text x="1460" y="495" fill="white" fontSize="13">• date_acquisition</text>
            </g>

            {/* Chauffeur */}
            <g>
              <rect x="1050" y="50" width="200" height="220" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="1150" y="75" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">CHAUFFEUR</text>
              <line x1="1050" y1="85" x2="1250" y2="85" stroke="white" strokeWidth="2"/>
              <text x="1060" y="105" fill="white" fontSize="13">• id_chauffeur</text>
              <text x="1060" y="125" fill="white" fontSize="13">• nom</text>
              <text x="1060" y="145" fill="white" fontSize="13">• prénom</text>
              <text x="1060" y="165" fill="white" fontSize="13">• num_permis</text>
              <text x="1060" y="185" fill="white" fontSize="13">• téléphone</text>
              <text x="1060" y="205" fill="white" fontSize="13">• email</text>
              <text x="1060" y="225" fill="white" fontSize="13">• disponibilité</text>
              <text x="1060" y="245" fill="white" fontSize="13">• date_embauche</text>
            </g>

            {/* Destination */}
            <g>
              <rect x="300" y="50" width="180" height="180" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="390" y="75" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">DESTINATION</text>
              <line x1="300" y1="85" x2="480" y2="85" stroke="white" strokeWidth="2"/>
              <text x="310" y="105" fill="white" fontSize="13">• id_destination</text>
              <text x="310" y="125" fill="white" fontSize="13">• ville</text>
              <text x="310" y="145" fill="white" fontSize="13">• pays</text>
              <text x="310" y="165" fill="white" fontSize="13">• zone_géo</text>
              <text x="310" y="185" fill="white" fontSize="13">• code_postal</text>
              <text x="310" y="205" fill="white" fontSize="13">• tarif_base</text>
            </g>

            {/* Type Service */}
            <g>
              <rect x="50" y="250" width="180" height="180" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="140" y="275" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TYPE_SERVICE</text>
              <line x1="50" y1="285" x2="230" y2="285" stroke="white" strokeWidth="2"/>
              <text x="60" y="305" fill="white" fontSize="13">• id_type_service</text>
              <text x="60" y="325" fill="white" fontSize="13">• libellé</text>
              <text x="60" y="345" fill="white" fontSize="13">• description</text>
              <text x="60" y="365" fill="white" fontSize="13">• délai_estimé</text>
              <text x="60" y="385" fill="white" fontSize="13">• tarif_poids</text>
              <text x="60" y="405" fill="white" fontSize="13">• tarif_volume</text>
            </g>

            {/* Tarification (NOUVELLE ENTITÉ) */}
            <g>
              <rect x="300" y="250" width="180" height="140" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="8"/>
              <text x="390" y="275" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TARIFICATION</text>
              <line x1="300" y1="285" x2="480" y2="285" stroke="white" strokeWidth="2"/>
              <text x="310" y="305" fill="white" fontSize="13">• id_tarification</text>
              <text x="310" y="325" fill="white" fontSize="13">• id_type_service</text>
              <text x="310" y="345" fill="white" fontSize="13">• id_destination</text>
              <text x="310" y="365" fill="white" fontSize="13">• date_validité</text>
            </g>

            {/* Expédition */}
            <g>
              <rect x="600" y="400" width="220" height="280" fill="#10B981" stroke="#059669" strokeWidth="2" rx="8"/>
              <text x="710" y="425" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">EXPEDITION</text>
              <line x1="600" y1="435" x2="820" y2="435" stroke="white" strokeWidth="2"/>
              <text x="610" y="455" fill="white" fontSize="13">• id_expedition</text>
              <text x="610" y="475" fill="white" fontSize="13">• num_expedition</text>
              <text x="610" y="495" fill="white" fontSize="13">• date_création</text>
              <text x="610" y="515" fill="white" fontSize="13">• poids</text>
              <text x="610" y="535" fill="white" fontSize="13">• volume</text>
              <text x="610" y="555" fill="white" fontSize="13">• description</text>
              <text x="610" y="575" fill="white" fontSize="13">• montant_total</text>
              <text x="610" y="595" fill="white" fontSize="13">• statut</text>
              <text x="610" y="615" fill="white" fontSize="13">• adresse_enlèvement</text>
              <text x="610" y="635" fill="white" fontSize="13">• adresse_livraison</text>
              <text x="610" y="655" fill="white" fontSize="13">• id_tarification</text>
            </g>

            {/* Tournée */}
            <g>
              <rect x="1100" y="400" width="200" height="240" fill="#10B981" stroke="#059669" strokeWidth="2" rx="8"/>
              <text x="1200" y="425" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">TOURNEE</text>
              <line x1="1100" y1="435" x2="1300" y2="435" stroke="white" strokeWidth="2"/>
              <text x="1110" y="455" fill="white" fontSize="13">• id_tournee</text>
              <text x="1110" y="475" fill="white" fontSize="13">• date_tournee</text>
              <text x="1110" y="495" fill="white" fontSize="13">• heure_départ</text>
              <text x="1110" y="515" fill="white" fontSize="13">• heure_retour</text>
              <text x="1110" y="535" fill="white" fontSize="13">• kilométrage</text>
              <text x="1110" y="555" fill="white" fontSize="13">• durée</text>
              <text x="1110" y="575" fill="white" fontSize="13">• consommation</text>
              <text x="1110" y="595" fill="white" fontSize="13">• statut</text>
              <text x="1110" y="615" fill="white" fontSize="13">• id_chauffeur</text>
              <text x="1110" y="635" fill="white" fontSize="13">• id_vehicule</text>
            </g>

            {/* Facture */}
            <g>
              <rect x="600" y="900" width="180" height="200" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" rx="8"/>
              <text x="690" y="925" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">FACTURE</text>
              <line x1="600" y1="935" x2="780" y2="935" stroke="white" strokeWidth="2"/>
              <text x="610" y="955" fill="white" fontSize="13">• id_facture</text>
              <text x="610" y="975" fill="white" fontSize="13">• num_facture</text>
              <text x="610" y="995" fill="white" fontSize="13">• date_facture</text>
              <text x="610" y="1015" fill="white" fontSize="13">• montant_HT</text>
              <text x="610" y="1035" fill="white" fontSize="13">• montant_TVA</text>
              <text x="610" y="1055" fill="white" fontSize="13">• montant_TTC</text>
              <text x="610" y="1075" fill="white" fontSize="13">• statut</text>
              <text x="610" y="1095" fill="white" fontSize="13">• id_client</text>
            </g>

            {/* Paiement */}
            <g>
              <rect x="1100" y="900" width="180" height="180" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" rx="8"/>
              <text x="1190" y="925" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">PAIEMENT</text>
              <line x1="1100" y1="935" x2="1280" y2="935" stroke="white" strokeWidth="2"/>
              <text x="1110" y="955" fill="white" fontSize="13">• id_paiement</text>
              <text x="1110" y="975" fill="white" fontSize="13">• date_paiement</text>
              <text x="1110" y="995" fill="white" fontSize="13">• montant</text>
              <text x="1110" y="1015" fill="white" fontSize="13">• mode_paiement</text>
              <text x="1110" y="1035" fill="white" fontSize="13">• référence</text>
              <text x="1110" y="1055" fill="white" fontSize="13">• statut</text>
              <text x="1110" y="1075" fill="white" fontSize="13">• id_facture</text>
            </g>

            {/* Incident */}
            <g>
              <rect x="1450" y="600" width="200" height="200" fill="#EF4444" stroke="#DC2626" strokeWidth="2" rx="8"/>
              <text x="1550" y="625" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">INCIDENT</text>
              <line x1="1450" y1="635" x2="1650" y2="635" stroke="white" strokeWidth="2"/>
              <text x="1460" y="655" fill="white" fontSize="13">• id_incident</text>
              <text x="1460" y="675" fill="white" fontSize="13">• type_incident</text>
              <text x="1460" y="695" fill="white" fontSize="13">• date_incident</text>
              <text x="1460" y="715" fill="white" fontSize="13">• description</text>
              <text x="1460" y="735" fill="white" fontSize="13">• gravité</text>
              <text x="1460" y="755" fill="white" fontSize="13">• statut</text>
              <text x="1460" y="775" fill="white" fontSize="13">• résolution</text>
              <text x="1460" y="795" fill="white" fontSize="13">• id_expedition</text>
              <text x="1460" y="815" fill="white" fontSize="13">• id_tournee</text>
            </g>

            {/* Réclamation */}
            <g>
              <rect x="50" y="900" width="200" height="220" fill="#F59E0B" stroke="#D97706" strokeWidth="2" rx="8"/>
              <text x="150" y="925" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">RECLAMATION</text>
              <line x1="50" y1="935" x2="250" y2="935" stroke="white" strokeWidth="2"/>
              <text x="60" y="955" fill="white" fontSize="13">• id_reclamation</text>
              <text x="60" y="975" fill="white" fontSize="13">• date_reclamation</text>
              <text x="60" y="995" fill="white" fontSize="13">• nature</text>
              <text x="60" y="1015" fill="white" fontSize="13">• description</text>
              <text x="60" y="1035" fill="white" fontSize="13">• statut</text>
              <text x="60" y="1055" fill="white" fontSize="13">• date_résolution</text>
              <text x="60" y="1075" fill="white" fontSize="13">• action_corrective</text>
              <text x="60" y="1095" fill="white" fontSize="13">• id_client</text>
              <text x="60" y="1115" fill="white" fontSize="13">• id_expedition</text>
            </g>

            {/* ASSOCIATIONS / RELATIONS */}

            {/* PASSER (Client - Expédition) */}
            <line x1="230" y1="705" x2="600" y2="505" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="415" cy="605" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="415" y="610" textAnchor="middle" fontSize="14" fontWeight="bold">PASSER</text>
            <text x="250" y="700" fontSize="12" fill="#374151">1,n</text>
            <text x="580" y="500" fontSize="12" fill="#374151">1,1</text>

            {/* UTILISER (Expédition - Tarification) */}
            <line x1="600" y1="530" x2="480" y2="320" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="540" cy="425" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="540" y="430" textAnchor="middle" fontSize="14" fontWeight="bold">UTILISER</text>
            <text x="590" y="525" fontSize="12" fill="#374151">1,n</text>
            <text x="470" y="315" fontSize="12" fill="#374151">1,1</text>

            {/* COMBINER (Tarification - Type Service) */}
            <line x1="300" y1="320" x2="230" y2="320" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="265" cy="320" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="265" y="325" textAnchor="middle" fontSize="13" fontWeight="bold">COMBINER</text>
            <text x="290" y="315" fontSize="12" fill="#374151">1,n</text>
            <text x="240" y="315" fontSize="12" fill="#374151">1,1</text>

            {/* APPLIQUER (Tarification - Destination) */}
            <line x1="390" y1="250" x2="390" y2="230" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="390" cy="240" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="390" y="245" textAnchor="middle" fontSize="13" fontWeight="bold">APPLIQUER</text>
            <text x="400" y="255" fontSize="12" fill="#374151">1,n</text>
            <text x="400" y="225" fontSize="12" fill="#374151">1,1</text>

            {/* INCLURE (Tournée - Expédition) */}
            <line x1="1100" y1="510" x2="820" y2="510" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="960" cy="510" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="960" y="515" textAnchor="middle" fontSize="14" fontWeight="bold">INCLURE</text>
            <text x="1080" y="505" fontSize="12" fill="#374151">1,1</text>
            <text x="830" y="505" fontSize="12" fill="#374151">0,n</text>

            {/* EFFECTUER (Chauffeur - Tournée) */}
            <line x1="1150" y1="270" x2="1150" y2="400" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1150" cy="335" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1150" y="340" textAnchor="middle" fontSize="14" fontWeight="bold">EFFECTUER</text>
            <text x="1130" y="280" fontSize="12" fill="#374151">1,n</text>
            <text x="1160" y="395" fontSize="12" fill="#374151">1,1</text>

            {/* UTILISER (Tournée - Véhicule) */}
            <line x1="1300" y1="460" x2="1450" y2="380" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1375" cy="420" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1375" y="425" textAnchor="middle" fontSize="14" fontWeight="bold">UTILISER</text>
            <text x="1280" y="455" fontSize="12" fill="#374151">1,n</text>
            <text x="1440" y="375" fontSize="12" fill="#374151">1,1</text>

            {/* FACTURER (Client - Facture) */}
            <line x1="140" y1="810" x2="600" y2="1000" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="370" cy="905" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="370" y="910" textAnchor="middle" fontSize="14" fontWeight="bold">FACTURER</text>
            <text x="160" y="820" fontSize="12" fill="#374151">1,n</text>
            <text x="590" y="995" fontSize="12" fill="#374151">1,1</text>

            {/* REGROUPER (Facture - Expédition) */}
            <line x1="710" y1="900" x2="710" y2="680" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="710" cy="790" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="710" y="795" textAnchor="middle" fontSize="14" fontWeight="bold">REGROUPER</text>
            <text x="690" y="895" fontSize="12" fill="#374151">1,1</text>
            <text x="720" y="685" fontSize="12" fill="#374151">1,n</text>

            {/* REGLER (Paiement - Facture) */}
            <line x1="1100" y1="990" x2="780" y2="990" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="940" cy="990" rx="50" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="940" y="995" textAnchor="middle" fontSize="14" fontWeight="bold">REGLER</text>
            <text x="1080" y="985" fontSize="12" fill="#374151">0,n</text>
            <text x="790" y="985" fontSize="12" fill="#374151">1,1</text>

            {/* CONCERNER (Incident - Expédition) */}
            <line x1="1450" y1="700" x2="820" y2="600" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1135" cy="650" rx="75" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1135" y="655" textAnchor="middle" fontSize="13" fontWeight="bold">CONCERNER</text>
            <text x="1430" y="695" fontSize="12" fill="#374151">0,n</text>
            <text x="830" y="595" fontSize="12" fill="#374151">0,1</text>

            {/* AFFECTER (Incident - Tournée) */}
            <line x1="1450" y1="680" x2="1300" y2="560" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="1375" cy="620" rx="65" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="1375" y="625" textAnchor="middle" fontSize="14" fontWeight="bold">AFFECTER</text>
            <text x="1430" y="675" fontSize="12" fill="#374151">0,n</text>
            <text x="1290" y="565" fontSize="12" fill="#374151">0,1</text>

            {/* DEPOSER (Client - Réclamation) */}
            <line x1="140" y1="810" x2="150" y2="900" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="145" cy="855" rx="60" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="145" y="860" textAnchor="middle" fontSize="14" fontWeight="bold">DEPOSER</text>
            <text x="160" y="815" fontSize="12" fill="#374151">1,n</text>
            <text x="165" y="895" fontSize="12" fill="#374151">1,1</text>

            {/* PORTER_SUR (Réclamation - Expédition) */}
            <line x1="250" y1="1010" x2="600" y2="640" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <ellipse cx="425" cy="825" rx="70" ry="30" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
            <text x="425" y="830" textAnchor="middle" fontSize="13" fontWeight="bold">PORTER_SUR</text>
            <text x="265" y="1005" fontSize="12" fill="#374151">0,n</text>
            <text x="590" y="645" fontSize="12" fill="#374151">0,n</text>

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
              
              <ellipse cx="15" cy="175" rx="15" ry="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
              <text x="35" y="180" fontSize="12" fill="#374151">Associations</text>
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

export default DeepSeek;